import mongoose from 'mongoose'
import request from 'supertest'
import {app} from '../../app'
import { OrderModel, OrderStatus } from '../../models/OrdersModel'
import { TicketModel } from '../../models/TicketsModel'
import { natsWrapper } from '../../nats-wrapper'

it('returns a 404 error if the ticket does not exits', async()=>{
   await request(app)
    .post('/api/orders')
    .set('Cookie',getCookie())
    .send({ticketId:mongoose.Types.ObjectId().toHexString()})
    .expect(404)
})

it('returns an error if the ticket is already reserved', async()=>{
  const id =new mongoose.Types.ObjectId().toHexString()
  const ticket = await TicketModel.create({
    title:'string',
    price:20
  })
  const newOrder = await OrderModel.create({
    userId:id,
    expiresAt:new Date(),
    ticket:ticket,
    status:OrderStatus.Created
  })
  const exist = await TicketModel.findById(ticket.id)
  const res = await request(app)
  .post('/api/orders')
  .set('Cookie',getCookie(id))
  .send({ticketId:ticket.id})
  .expect(400)
  .expect({
    errors:[
      {
        message:'Ticket is already reserved'
      }
    ]
  })
})

it('reserves a ticket', async()=>{
  const ticketId = new mongoose.Types.ObjectId().toHexString()
  const id = new mongoose.Types.ObjectId().toHexString()
  const ticket = await TicketModel.build({
    id:ticketId,
    title:'string',
    price:20
  })
  const res = await request(app)
    .post('/api/orders')
    .set('Cookie',getCookie(id))
    .send({ticketId:ticket.id})
    .expect(201)
  expect(res.body.ticket.id).toEqual(ticket.id)
})


it('publishes a order created event',async()=>{
  const id =new mongoose.Types.ObjectId().toHexString()
  const ticketId = new mongoose.Types.ObjectId().toHexString()
  const ticket = await TicketModel.build({
    id: ticketId,
    title:'string',
    price:20
  })
  const res = await request(app)
    .post('/api/orders')
    .set('Cookie',getCookie(id))
    .send({ticketId:ticket.id})
    .expect(201)
  expect(res.body.ticket.id).toEqual(ticket.id)
  expect(natsWrapper.client.publish).toHaveBeenCalled()
})