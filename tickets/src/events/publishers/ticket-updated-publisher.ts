import { Publisher,Subjects } from "@tikzsztickets/common";
import { TicketUpdatedEvent} from "@tikzsztickets/common/build/events/events-interface/";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
 subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}

