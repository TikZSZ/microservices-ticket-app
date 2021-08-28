import { OrderCreatedEvent, Subjects } from "@tikzsztickets/common";
import { Publisher } from "@tikzsztickets/common";



export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent>{
  subject: Subjects.OrderCreated = Subjects.OrderCreated
}