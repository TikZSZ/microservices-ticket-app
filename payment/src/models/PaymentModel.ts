import { OrderCancelledEvent, OrderStatus } from '@tikzsztickets/common'
import mongoose from 'mongoose'
import { OrderCreatedListener } from '../events/listener/order-created-listener'

interface PaymentAttrs{
  order:{
    orderId:string,
    price:number
  }
}

interface PaymentDoc extends mongoose.Document {
  order:{
    orderId:string,
    price:number,
    status: OrderStatus
  }
  version:string
}

interface PaymentModel extends mongoose.Model<PaymentDoc>{}

interface ReturnedPaymentsDoc{
  id?: string;
  _id?: string;
  __v?: string;
} 

const paymentSchema = new mongoose.Schema<PaymentDoc,PaymentModel>({
  order:{
    type:{},
    required: true
  }
},{
  toJSON:{
    transform(doc:PaymentDoc,ret:ReturnedPaymentsDoc){
      ret.id = ret._id
      delete ret.__v
      delete ret._id
    }
  },
  optimisticConcurrency: true,
  versionKey: 'version'
})


export const PaymentModel = mongoose.model('payment',paymentSchema)