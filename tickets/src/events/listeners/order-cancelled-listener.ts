import { Listener, OrderCancelledEvent, Subjects } from "@tikzsztickets/common";
import { Message } from "node-nats-streaming";
import { TicketDoc, TicketModel } from "../../models/TicketsModel";
import { queGroupName } from "./queGroupName";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queGroupName = queGroupName;
  async onMessage(eventData: OrderCancelledEvent["data"], msg: Message) {
    const { ticket } = eventData;

    //Find the ticket to be unreserved.
    const existingTicket = await TicketModel.findById(ticket.ticketId);
    // If no ticket return
    if (!existingTicket) {
      console.log("Ticket does not exist cant unreserve");
      return;
    }

    // Mark the ticket as being unreserved
    existingTicket.set({ orderId: undefined });

    // Save the ticket
    await existingTicket.save();

    // Publish Ticket updated Event
    await this.publishTicketUpdatedEvent(existingTicket);

    console.log(existingTicket, " this is inside order cancelled listener");

    msg.ack();
  }

  async publishTicketUpdatedEvent(unreservedTicket: TicketDoc) {
    const { id, price, title, version, userId, orderId } = unreservedTicket;
    return await new TicketUpdatedPublisher(this.client).publish({
      id,
      price,
      version,
      userId,
      title,
      orderId,
    });
  }
}
