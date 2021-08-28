import mongoose, { Model, Schema, Document } from "mongoose";
import { OrderModel, OrderStatus } from "./OrdersModel";

interface TicketAttrs {
  id:string;
  title: string;
  price: number;
}

export interface TicketDoc extends Document {
  title: string;
  price: number;
  isReserved(): Promise<boolean>;
  version: number;
  orderId?:string
}
interface TicketModel extends Model<TicketDoc> {
  build: (attrs: TicketAttrs) => Promise<TicketDoc>;
  findByEvent: (event: { id: string; version: number }) =>Promise<TicketDoc|null>
}

interface ReturnedTicketsDoc {
  id?: string;
  _id?: string;
  title?: string;
  price?: number;
  __v?: string;
}

const ticketSchema = new Schema<TicketDoc, TicketModel>(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    orderId: {
      type: String,
      required: false
    }
  },
  {
    toJSON: {
      transform: (doc: TicketDoc, ret: ReturnedTicketsDoc) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
    versionKey: "version",
    optimisticConcurrency: true,

  }
);
ticketSchema.statics.build = (attrs: TicketAttrs) => {
  const {id,title,price} = attrs
  return TicketModel.create({_id:id,title,price})
};

ticketSchema.statics.findByEvent = async (event: { id: string; version: number }) => {
  const {id,version} = event
  return TicketModel.findOne({
    _id: id,
    version: version - 1,
  });
};

ticketSchema.methods.isReserved = async function (): Promise<boolean> {
  // Run query to look at all orders. Find an order where the ticket
  // is the ticket we just found *and* the orders status is *not* cancelled.
  // If we find an order from that means the ticket *is* reserved.
  const associatedOrder = await OrderModel.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });
  return !!associatedOrder;
};

export const TicketModel = mongoose.model("Ticket", ticketSchema);
