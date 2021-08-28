import mongoose from 'mongoose'
import request from 'supertest'
import {app} from '../../app'
import { OrderModel, OrderStatus } from '../../models/OrdersModel'
import { TicketModel } from '../../models/TicketsModel'


it('fetches a order',async () =>{
  const userId =new mongoose.Types.ObjectId().toHexString()
  const ticket = await TicketModel.create({
    title:'string',
    price:20
  })
  const newOrder = await OrderModel.create({
    userId:userId,
    expiresAt:new Date(),
    ticket:ticket,
    status:OrderStatus.Created
  })
  const res = await request(app)
    .get(`/api/orders/${newOrder.id}`)
    .set('Cookie',getCookie(userId))
    .expect(200)
  expect(res.body.id).toEqual(newOrder.id)
})