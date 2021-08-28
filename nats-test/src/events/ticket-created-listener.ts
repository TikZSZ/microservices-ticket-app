import { Message } from "node-nats-streaming";
import { Listener } from "./base-listener";
import { Subjects } from "./subjects";
import { TicketCreatedEvent } from "./ticket-created-event";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queGroupName = "orders-service-queue-group";

  onMessage(eventData: TicketCreatedEvent["data"], msg: Message) {
    console.log(eventData);

    msg.ack();
  }
}
