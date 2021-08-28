import mongoose from "mongoose"
import { OrderModel, OrderStatus } from "../../../models/OrdersModel"
import { TicketModel } from "../../../models/TicketsModel"
import { natsWrapper } from "../../../nats-wrapper"
import { OrderExpirationListener } from "../order-expiration-listener"
import {ExpirationCompleteEvent} from '@tikzsztickets/common'
import {Message} from 'node-nats-streaming'

const setup = async() => {
  const listener = new OrderExpirationListener(natsWrapper.client)

  const ticket = await TicketModel.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  })
 
  const order = OrderModel.build({
    expiresAt:new Date(),
    status: OrderStatus.Created,
    ticket:ticket,
    userId: mongoose.Types.ObjectId().toHexString()
  })
  await order.save()

  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id
  }
  // @ts-ignore
  const msg: Message = {
    ack:jest.fn()
  }
  return {listener , order , ticket, data, msg}
}

it('updates order status to cancelled', async () =>{
  const {listener , order , ticket, data, msg} = await setup() 
  await listener.onMessage(data,msg)

  const updatedOrder = await OrderModel.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})


it('emits an OrderCancelled event', async ()=>{ 
  const {listener , order , ticket, data, msg} = await setup() 
  await listener.onMessage(data,msg)

  const updatedOrder = await OrderModel.findById(order.id);

  expect(natsWrapper.client.publish).toHaveBeenCalled()
  
  const eventData =JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[1][1])
  console.log(eventData)
  expect(eventData.orderId).toEqual(updatedOrder!.id)
  expect(eventData.status).toEqual(updatedOrder!.status)

})

it('acks the message', async ()=>{
  const {listener , order , ticket, data, msg} = await setup() 
  await listener.onMessage(data,msg)

  const updatedOrder = await OrderModel.findById(order.id);
  
  expect(msg.ack).toHaveBeenCalled()
})