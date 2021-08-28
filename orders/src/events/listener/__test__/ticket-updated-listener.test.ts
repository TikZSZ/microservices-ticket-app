import mongoose from 'mongoose'
import { TicketUpdatedListener } from '../ticket-updated-listener'
import {Message} from 'node-nats-streaming'
import { TicketDoc, TicketModel } from '../../../models/TicketsModel'
import { natsWrapper } from '../../../nats-wrapper'
import { TicketUpdatedEvent } from '@tikzsztickets/common'
const setup = async () =>{
  const id = new mongoose.Types.ObjectId().toHexString()
  const userId = new mongoose.Types.ObjectId().toHexString()

  const ticket = await TicketModel.create({_id:id,userId,title: 'Concert',price:20})

  const newData:TicketUpdatedEvent['data'] = {
    id:id,
    title: ticket.title,
    price:500,
    version: ticket.version+1,
    userId
  }

  const ticketUpdatedListener = new TicketUpdatedListener(natsWrapper.client)

  const msg = {
    ack:jest.fn()
  } as unknown as Message

  return { newData,msg,ticketUpdatedListener}
}

it('finds, updates , saves a ticket and acks', async ()=>{
  const { newData,msg,ticketUpdatedListener} = await setup() 
  await ticketUpdatedListener.onMessage({
    ...newData
  }, msg)

  //find updated ticket
  const updatedTicket = await  TicketModel.findById(newData.id)

  //test fields updated
  expect(updatedTicket!.version).toEqual(newData.version)
  expect(updatedTicket!.price).toEqual(newData.price)  

  //ack check
  expect(msg.ack).toHaveBeenCalled()
})

it('does not ack if event has skipped version number', async ()=>{
  const { newData,msg,ticketUpdatedListener} = await setup() 
  newData.version = 3
  await ticketUpdatedListener.onMessage({
    ...newData
  }, msg)

  //find updated ticket
  const updatedTicket = await  TicketModel.findById(newData.id)

  //test fields should not be updated
  expect(updatedTicket!.version).not.toEqual(newData.version)
  expect(updatedTicket!.price).not.toEqual(newData.price)  

  //ack check
  expect(msg.ack).not.toHaveBeenCalled()
})

