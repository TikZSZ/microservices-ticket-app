import { TicketModel } from "../../../models/TicketsModel";
import { Message } from "node-nats-streaming";
import { Types } from "mongoose";
import { OrderCreatedEvent, OrderStatus } from "@tikzsztickets/common";
import { OrderCreatedListener } from "../order-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
const setup = async () => {
  //create a instance of the listener
  const orderCreatedListener = new OrderCreatedListener(natsWrapper.client);

  // Create and save a ticket
  const data = {
    title: "Concert",
    price: 200,
    userId: Types.ObjectId().toHexString(),
  };
  const ticket = await TicketModel.create({ ...data });
  
  // fake msg Object
  const msg = {
    ack: jest.fn(),
  } as unknown as Message;

  // create fake data event
  const orderEventData: OrderCreatedEvent["data"] = {
    orderId: Types.ObjectId().toHexString(),
    expiresAt: new Date().toISOString(),
    status: OrderStatus.Created,
    ticket: { ticketId: ticket.id, price: ticket.price },
    version: 0,
  };
  return { ticket, orderCreatedListener, orderEventData, msg };
};

it("reserves a ticket", async () => {
  const { ticket, orderCreatedListener, orderEventData, msg } = await setup();

  await orderCreatedListener.onMessage(orderEventData, msg);

  const updatedTicket = await TicketModel.findById(ticket.id);
  if (!updatedTicket) {
    throw new Error("Should not reach here");
  }

  //test ticket was updated
  expect(updatedTicket!.orderId).toEqual(orderEventData.orderId);
  expect(msg.ack).toBeCalled();

  //test that event was published
  expect(natsWrapper.client.publish).toHaveBeenCalled();

  // test that event called with data has the id etc from the data
  const { id, price, version, userId, title, orderId } = updatedTicket;

  // test that publish has been called with correct arguments for tickedUpdated Event
  // with orderId coz its now Reserved i.e orderId != undefined
  const updateTicketEvent = {
    id,
    price,
    version,
    userId,
    title,
    orderId,
  };
  expect(JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])).toEqual(updateTicketEvent);
});

it("does not reserves a ticket on wrong ticketId", async () => {
  const { ticket, orderCreatedListener, orderEventData, msg } = await setup();

  // fake ticketId
  orderEventData.ticket.ticketId = Types.ObjectId().toHexString();

  await orderCreatedListener.onMessage(orderEventData, msg);

  const updatedTicket = await TicketModel.findById(ticket.id);

  expect(updatedTicket!.orderId).toBeUndefined();
  expect(msg.ack).not.toBeCalled();
});
