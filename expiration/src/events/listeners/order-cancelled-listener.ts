import { Listener, OrderCancelledEvent, OrderStatus, Subjects } from "@tikzsztickets/common";
import { queGroupName } from "./queGroupName";
import {Message} from 'node-nats-streaming'
import { expirationQueue } from "../../queues/expiration-queue";
export class OrderCancelledListener extends Listener<OrderCancelledEvent>{
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled

  queGroupName =  queGroupName

  async onMessage(eventData:OrderCancelledEvent['data'], msg:Message){
    const {orderId} = eventData
    await expirationQueue.removeJobs(orderId)
    msg.ack()
  }

} 