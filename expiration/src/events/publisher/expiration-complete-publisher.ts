import { ExpirationCompleteEvent, Publisher, Subjects} from "@tikzsztickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent>{
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete
}