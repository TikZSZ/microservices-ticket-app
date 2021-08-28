import { Listener, OrderCreatedEvent, Subjects } from "@tikzsztickets/common";
import { Message } from "node-nats-streaming";
import { TicketDoc, TicketModel } from "../../models/TicketsModel";
import { queGroupName } from "./queGroupName";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";


export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queGroupName = queGroupName;

  async publishTicketUpdatedEvent(reservedTicket: TicketDoc) {
    const { id, price, title, version, userId, orderId } = reservedTicket;
    return await new TicketUpdatedPublisher(this.client).publish({
      id,
      price,
      version,
      userId,
      title,
      orderId,
    });
  }

  async onMessage(eventData: OrderCreatedEvent["data"], msg: Message) {
    const { orderId,  ticket } = eventData;

    //Find the ticket that the order is reserving
    const existingTicket  = await TicketModel.findById(ticket.ticketId)

    // If no ticket return
    if(!existingTicket){
      console.log('ticket not found cant reserve')
      return
    }

    // Mark the ticket as being reserved 
    existingTicket.set({orderId:orderId})

    // Save the ticket
    await existingTicket.save()
    // Publish Ticket updated Event
    await this.publishTicketUpdatedEvent(existingTicket)
    
    msg.ack()
  }
}

//use if replication enabled
// const session = await mongoose.startSession()
    // session.startTransaction();

    // const updatedTicket  = await TicketModel.findById(ticket.ticketId).session(session)
    // const {id,price,title,version,userId} = updatedTicket!
    // updatedTicket!.orderId = orderId
    // await updatedTicket!.save({session})
    // try{
    //   await new TicketUpdatedPublisher(natsWrapper.client).publish({
    //     id,price,version,userId,title
    //   })
    // }catch(err){
    //   await session.abortTransaction()
    //   return
    // }
    // await session.commitTransaction()