import mongoose from 'mongoose'
import request from 'supertest'
import {app} from '../../app'
import { OrderModel, OrderStatus } from '../../models/OrdersModel'
import { TicketModel } from '../../models/TicketsModel'

async function createOrder(id:string,ticket:any){
  const newOrder = await OrderModel.create({
    userId:id,
    expiresAt:new Date(),
    ticket:ticket,
    status:OrderStatus.Created
  })
}

async function buildTicket(){
  const ticket = await TicketModel.create({
    title:'string',
    price:20
  })
  return ticket
}



it('reserves a ticket', async()=>{
  const id1 =new mongoose.Types.ObjectId().toHexString()
  const id2 =new mongoose.Types.ObjectId().toHexString()

  const ticket1  = await buildTicket()
  const ticket2  = await buildTicket()
  const ticket3  = await buildTicket()

  await createOrder(id1,ticket1)
  await createOrder(id2,ticket2)
  await createOrder(id2,ticket3)

  const res = await request(app)
    .get('/api/orders')
    .set('Cookie',getCookie(id1))
  expect(res.body.length).toEqual(1)
  const res1 = await request(app)
    .get('/api/orders')
    .set('Cookie',getCookie(id2))
  expect(res1.body.length).toEqual(2)
})
