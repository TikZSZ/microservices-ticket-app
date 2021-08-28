import { NotAuthorizedError, NotFoundError, OrderStatus, requireAuth } from "@tikzsztickets/common"
import {Router,Request,Response} from "express"
import { OrderCancelledPublisher } from "../events/publisher/order-cancelled-publisher"
import { OrderModel } from "../models/OrdersModel"
import { natsWrapper } from "../nats-wrapper"

const router = Router()

interface RequestWithBody extends Request {
  params:{
    orderId:string
  }
}

router.delete('/api/orders/:orderId', requireAuth ,async (req:RequestWithBody,res:Response)=>{
  const {orderId} = req.params
  const order = await OrderModel.findById(orderId).populate('ticket')
  
  if(!order){
    throw new NotFoundError()
  }
  
  if(order.userId !== req.currentUser!.id){
    throw new NotAuthorizedError()
  }
  
  order.status = OrderStatus.Cancelled
  
  await order.save()
  const orderCancelledPublisher = new OrderCancelledPublisher(natsWrapper.client)

  const {id,version,expiresAt,userId, ticket} = order

  await orderCancelledPublisher.publish({
    orderId:id,
    version:version,
    status: OrderStatus.Cancelled,
    ticket:{
      ticketId: ticket.id,
      price: ticket.price
    }
  })
  res.status(204).send({})
})


export {router as deleteOrderRouter}

