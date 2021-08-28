 import { Publisher,Subjects } from "@tikzsztickets/common";
 import { TicketCreatedEvent } from "@tikzsztickets/common/build/events/events-interface";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}

