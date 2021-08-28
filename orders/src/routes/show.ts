import { NotAuthorizedError, NotFoundError, requireAuth } from "@tikzsztickets/common"
import {Router,Request,Response} from "express"
import { OrderModel } from "../models/OrdersModel"

const router = Router()

router.get('/api/orders/:orderId',[requireAuth], async (req:Request,res:Response)=>{
  const {orderId} = req.params

  const order = await OrderModel.findById(orderId).populate('ticket')

  if(!order){
    throw new NotFoundError()
  }

  if(req.currentUser!.id !== order.userId){
    throw new NotAuthorizedError()
  }
  res.status(200).send(order)
})


export {router as showOrderRouter}