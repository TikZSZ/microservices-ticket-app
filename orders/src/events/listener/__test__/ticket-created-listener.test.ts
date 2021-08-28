import mongoose from 'mongoose'
import { TicketCreatedListener } from '../ticket-created-listener'
import {Message} from 'node-nats-streaming'
import { TicketModel } from '../../../models/TicketsModel'
import { natsWrapper } from '../../../nats-wrapper'
import { TicketCreatedEvent } from '@tikzsztickets/common'
const setup = async () =>{
  const ticketCreatedListener = new TicketCreatedListener(natsWrapper.client)
  const id = new mongoose.Types.ObjectId().toHexString()
  const userId = new mongoose.Types.ObjectId().toHexString()

  // create a fake ticket
  const data:TicketCreatedEvent['data'] = {
    id:id,
    title: 'Concert',
    price:20,
    version: 0,
    userId
  }
  const msg = {
    ack:jest.fn()
  } as unknown as Message
  // call onMessage on ticketUpdatedPublisher  and verify result
  
  return { data,msg,ticketCreatedListener}
}

it('creates and saves a ticket', async ()=>{
  const { data,msg,ticketCreatedListener} = await setup() 
  await ticketCreatedListener.onMessage({
    ...data
  }, msg)
  const ticket =await TicketModel.findById(data.id)
  expect(ticket!.id).toEqual(data.id)
})

it('acks the message', async()=>{
  const { data,msg,ticketCreatedListener} = await setup() 
  await ticketCreatedListener.onMessage({
    ...data
  }, msg)
  const ticket =await TicketModel.findById(data.id)
  expect(ticket!.id).toEqual(data.id)
  expect(msg.ack).toHaveBeenCalled()
})