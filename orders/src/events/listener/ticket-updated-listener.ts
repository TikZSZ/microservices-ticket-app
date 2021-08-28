import { Listener, Subjects, TicketUpdatedEvent } from "@tikzsztickets/common";
import { queGroupName } from "./queGroupName";
import { Message } from "node-nats-streaming";
import { TicketModel } from "../../models/TicketsModel";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queGroupName = queGroupName;
  async onMessage(eventData: TicketUpdatedEvent["data"], msg: Message) {
    const { price, title, id ,version,orderId } = eventData;

    console.log(eventData,'this is inside ticket updated listener')

    const ticket = await TicketModel.findByEvent({id,version})
    
    if (!ticket) {
      console.log('ticket not found ')
      return
    }
    ticket.set({
      title,
      price,
      orderId:orderId
    });
    await ticket.save();
    console.log(ticket, ' this is inside ticket updated listener')
    msg.ack()
  }
}
  