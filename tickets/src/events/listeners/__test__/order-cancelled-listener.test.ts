import { TicketDoc, TicketModel } from "../../../models/TicketsModel";
import { Message } from "node-nats-streaming";
import { Types } from "mongoose";
import {
  OrderCancelledEvent,
  OrderCreatedEvent,
  OrderStatus,
} from "@tikzsztickets/common";
import { OrderCreatedListener } from "../order-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";

const setup = async () => {
  //create a instance of the listener
  const orderCancelledListener = new OrderCancelledListener(natsWrapper.client);

  // Create and save a ticket
  const orderId = Types.ObjectId().toHexString();
  const data = {
    title: "Concert",
    price: 200,
    userId: Types.ObjectId().toHexString(),
  };

  const ticket = await TicketModel.create({ ...data });
  const reservedTicket = await TicketModel.findById(ticket.id);
  reservedTicket!.orderId = orderId;
  await reservedTicket!.save();

  // fake msg Object
  const msg = {
    ack: jest.fn(),
  } as unknown as Message;

  // create fake data event
  const orderEventData: OrderCancelledEvent["data"] = {
    orderId: orderId,
    status: OrderStatus.Cancelled,
    ticket: { ticketId: ticket.id, price: ticket.price },
    version: 2,
  };
  return { ticket, orderCancelledListener, orderEventData, msg };
};

it("unReserves the ticket, publishes ticket updated event and acks the msg", async () => {
  //unreserve ticket
  const { ticket, orderCancelledListener, orderEventData, msg } = await setup();

  await orderCancelledListener.onMessage(orderEventData, msg);

  const unReservedTicket = await TicketModel.findById(ticket.id);

  // test ticket has been updated
  expect(unReservedTicket!.orderId).toBeUndefined();
  expect(unReservedTicket!.version).toEqual(2);
  //test publish has been called
  expect(natsWrapper.client.publish).toHaveBeenCalled();

  // @ts-ignore
  const { id, price, version, userId, title, orderId } = unReservedTicket;

  // test that publish has been called with correct arguments for tickedUpdated Event
  // without orderId coz its now unReserved i.e orderId = undefined
  const updateTicketEvent = { id, price, version, userId, title, orderId };

  expect(
    JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])
  ).toEqual(updateTicketEvent);
});
