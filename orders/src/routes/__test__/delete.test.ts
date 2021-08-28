import mongoose from 'mongoose'
import request from 'supertest'
import { app } from '../../app'
import { OrderModel, OrderStatus } from '../../models/OrdersModel'
import { TicketModel } from '../../models/TicketsModel'
import { natsWrapper } from '../../nats-wrapper'


it('throws error if order does not exist', async () =>{
    const randomId = mongoose.Types.ObjectId().toHexString()
    await request (app)
        .delete(`/api/orders/${randomId}`)
        .set('Cookie', getCookie())
        .expect(404)
})

it('throws error if user does not own the order', async () =>{
    const userId = mongoose.Types.ObjectId().toHexString()
    const randomId = mongoose.Types.ObjectId().toHexString()

    const ticket = await TicketModel.create({
        title:'Concert',
        price:20
    })
    const order = await OrderModel.create({
        userId:userId,
        status:OrderStatus.Created,
        expiresAt: new Date(),
        ticket:ticket
    })
    const res = await request (app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', getCookie(randomId))
        .expect(401)
})


it('returns a order with cancelled status', async () =>{
  const userId = mongoose.Types.ObjectId().toHexString()

  const ticket = await TicketModel.build({
      id:new mongoose.Types.ObjectId().toHexString(),
      title:'Concert',
      price:20
  })
  const order = await OrderModel.create({
      userId:userId,
      status:OrderStatus.Created,
      expiresAt: new Date(),
      ticket:ticket
  })
  await request(app)
      .delete(`/api/orders/${order.id}`)
      .set('Cookie', getCookie(userId))
      .expect(204)
  const verifyOrder  = await OrderModel.findById(order.id)
  expect(verifyOrder!.status).toEqual(OrderStatus.Cancelled)

})


it('emits a order cancelled event',async ()=> { 
  const userId = mongoose.Types.ObjectId().toHexString()
  const randomId = mongoose.Types.ObjectId().toHexString()

  const ticket = await TicketModel.build({
      id:new mongoose.Types.ObjectId().toHexString(),
      title:'Concert',
      price:20
  })
  const order = await OrderModel.create({
      userId:userId,
      status:OrderStatus.Created,
      expiresAt: new Date(),
      ticket:ticket
  })
  await request(app)
      .delete(`/api/orders/${order.id}`)
      .set('Cookie', getCookie(userId))
      .expect(204)
  const verifyOrder  = await OrderModel.findById(order.id)
  expect(verifyOrder!.status).toEqual(OrderStatus.Cancelled)
  expect(natsWrapper.client.publish).toHaveBeenCalled()
})