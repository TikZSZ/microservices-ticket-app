import { OrderModel, OrderStatus } from "../OrdersModel";
import mongoose from "mongoose";
import { TicketModel } from "../TicketsModel";

it("implements optimistic concurrency control", async () => {
  const ticket = await TicketModel.create({
    title: "string",
    price: 20,
  });

  const instance1 = await TicketModel.findById(ticket.id);
  const instance2 = await TicketModel.findById(ticket.id);

  instance1!.price = 30
  await instance1!.save();
  try {
    await instance2!.save();
  } catch (err) {
    return new Promise<void>((res, rej) => {
      res();
    });
  }

  throw new Error("Should not reach here");
});

it('increments the version on multiple save',async ()=>{
  const ticket = await TicketModel.create({
    title: "string",
    price: 20,
  });
  expect(ticket.version).toEqual(0)
  const savedTicket = await TicketModel.findById(ticket.id);
  savedTicket!.price = 30
  await savedTicket!.save()
  expect(savedTicket!.version).toEqual(1)
  savedTicket!.price = 500
  await savedTicket!.save()
  expect(savedTicket!.version).toEqual(2)
})