import {
  ExpirationCompleteEvent,
  Listener,
  OrderStatus,
  Subjects,
  TicketCreatedEvent,
} from "@tikzsztickets/common";
import { queGroupName } from "./queGroupName";
import { Message } from "node-nats-streaming";
import { TicketModel } from "../../models/TicketsModel";
import { OrderDoc, OrderModel } from "../../models/OrdersModel";
import { TicketUpdatedListener } from "./ticket-updated-listener";
import { natsWrapper } from "../../nats-wrapper";
import { OrderCancelledPublisher } from "../publisher/order-cancelled-publisher";

export class OrderExpirationListener extends Listener<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;

  queGroupName = queGroupName;

  async onMessage(eventData: ExpirationCompleteEvent["data"], msg: Message) {
    const { orderId: id } = eventData;
    console.log(eventData);
    const order = await OrderModel.findById(id).populate("ticket");

    if (!order) {
      return console.log("Order not found");
    }

    if (order.status === OrderStatus.Complete) {
      msg.ack()
      return console.log("order complete cant cancel");
    }

    try {
      // cancel the order 
      order.set({ status: OrderStatus.Cancelled });

      await order.save();
      // publish cancel order event
      await this.publishOrderCancelledEvent(order)

    }catch (err){
      return console.log(err);
    }

    msg.ack();
  }

  async publishOrderCancelledEvent(order:OrderDoc){
    return await new OrderCancelledPublisher(natsWrapper.client).publish({
      orderId: order.id,
      status: OrderStatus.Cancelled,
      version: order.version,
      ticket: {
        ticketId: order.ticket.id,
        price: order.ticket.price,
      },
    })
  }
}
