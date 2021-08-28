import { Listener, OrderCreatedEvent, OrderStatus, Subjects } from "@tikzsztickets/common";
import { queGroupName } from "./queGroupName";
import {Message} from 'node-nats-streaming'
import { expirationQueue } from "../../queues/expiration-queue";
export class OrderCreatedListener extends Listener<OrderCreatedEvent>{
  subject: Subjects.OrderCreated = Subjects.OrderCreated

  queGroupName =  queGroupName

  async onMessage(eventData:OrderCreatedEvent['data'], msg:Message){
    const {orderId, expiresAt} = eventData

    const delay = new Date(expiresAt).getTime() - new Date().getTime()

    console.log(`waiting ${delay} milliseconds before expiring order`)

    await expirationQueue.add({orderId},{delay,jobId:orderId})

    msg.ack()
  }

} 