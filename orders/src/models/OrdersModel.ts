import {Document, model, Model, Schema} from "mongoose"
import {OrderStatus} from "@tikzsztickets/common"
import { TicketDoc } from "./TicketsModel"
export {OrderStatus}

interface OrderAttrs{
  userId:string,
  status:OrderStatus,
  expiresAt:Date,
  ticket:TicketDoc
}

export interface OrderDoc extends Document {
  userId:string,
  status:OrderStatus,
  expiresAt:Date,
  ticket:TicketDoc,
  version:number
}

interface OrderModel extends Model<OrderDoc>{
  build(attrs:OrderAttrs): OrderDoc;
}

interface ReturnedOrdersDoc{
  id?: string;
  _id?: string;
  __v?: string;
} 

const ordersSchema = new Schema<OrderDoc,OrderModel>({
  userId:{
    type:String,
    require:true
  },
  expiresAt:{
    type:Schema.Types.Date
  },
  status:{
    type:String,
    enum:Object.values(OrderStatus),
    require:true,
    default: OrderStatus.Created
  },
  ticket:{
    type:Schema.Types.ObjectId,
    ref:'Ticket'
  }
},{
  toJSON:{
    transform(doc: OrderDoc, ret: ReturnedOrdersDoc){
      ret.id = ret._id
      delete ret._id
      delete ret.__v
    }
  },
  optimisticConcurrency: true,
  versionKey: 'version'
})

ordersSchema.statics.build = (attrs:OrderAttrs)=>{
  return new OrderModel(attrs)
}

const OrderModel = model('Order',ordersSchema)


export {OrderModel}