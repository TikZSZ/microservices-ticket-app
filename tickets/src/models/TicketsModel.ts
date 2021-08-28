import mongoose, { Model, Document, Schema } from "mongoose";

interface TicketAttrs {
  title: string;
  price: number;
  userId:string;
}

export interface TicketDoc extends Document{
  title: string;
  price: number;
  userId:string;
  version:number;
  orderId?:string;
}

interface TicketModel extends Model<TicketDoc> {
  build:(attrs:TicketAttrs) => TicketDoc
}

interface ReturnedTicketsDoc {
  id?: string;
  _id?: string;
  title?: string;
  price?: number;
  __v?: string;
  version?: string;
}

const ticketSchema = new Schema<TicketDoc, TicketModel>(
  {
    title: {
      type:String,
      required:true
    },
    price: {
      type:Number,
      required:true
    },
    userId: {
      type:String,
      required:true
    },
    orderId:{
      type:String,
      required: false,
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
    optimisticConcurrency: true,
    

  }
);

ticketSchema.set('versionKey','version')

ticketSchema.statics.build = (attrs:TicketAttrs) => {
  return new  TicketModel(attrs)
}

export const TicketModel = mongoose.model("Ticket", ticketSchema);

