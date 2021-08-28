import { OrderCancelledEvent, Subjects } from "@tikzsztickets/common";
import { Publisher } from "@tikzsztickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent>{
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled
}