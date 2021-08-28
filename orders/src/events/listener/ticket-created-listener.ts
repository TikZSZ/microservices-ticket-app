import { Listener, Subjects, TicketCreatedEvent } from "@tikzsztickets/common";
import { queGroupName } from "./queGroupName";
import { Message } from "node-nats-streaming";
import { TicketModel } from "../../models/TicketsModel";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queGroupName = queGroupName;
  async onMessage(eventData: TicketCreatedEvent["data"], msg: Message) {
    const { price, title, id} = eventData;
    try{
      await TicketModel.build({ id, title, price });
    }catch(err){
      return
    }
    msg.ack();
  }
}

