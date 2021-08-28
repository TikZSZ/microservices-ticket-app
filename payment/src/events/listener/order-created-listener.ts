import {OrderCreatedEvent,Subjects,Listener} from '@tikzsztickets/common'
import { Message } from 'node-nats-streaming'
import { queGroupName } from './queGroupName'

export class OrderCreatedListener extends Listener<OrderCreatedEvent>{
  subject: Subjects.OrderCreated = Subjects.OrderCreated
  queGroupName = queGroupName

  onMessage(eventData:OrderCreatedEvent['data'], msg:Message){
    
  }
}