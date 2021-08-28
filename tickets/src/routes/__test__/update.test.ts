import request from "supertest";
import { app } from "../../app";
import mongoose, { Types } from "mongoose";
import { natsWrapper } from "../../nats-wrapper";
import { TicketModel } from "../../models/TicketsModel";

const payload = {
  title: "string",
  price: 10,
};

const newPayload = { title: "NotString", price: 20 };

async function createTicket() {
  return await request(app)
    .post("/api/tickets")
    .set("Cookie", getCookie())
    .send(payload)
    .expect(201);
}

it("returns 404 if provided ticket id does not exist", async () => {
  await request(app)
    .put(`/api/tickets/${new mongoose.Types.ObjectId().toHexString()}`)
    .set("Cookie", getCookie())
    .send(payload)
    .expect(404);
});

it("returns 401 if user is not authenticated", async () => {
  const ticket = (await createTicket()).body;
  const res = await request(app).put(`/api/tickets/${ticket.id}`).send(newPayload).expect(401);
});

it("returns 401 if user does not own the ticket", async () => {
  const ticket = (await createTicket()).body;

  const newPayload = { title: "NotString", price: 20 };

  const res = await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set("Cookie", getCookie("6"))
    .send(newPayload)
    .expect(401)
    .expect({
      errors: [
        {
          message: "Not authorized",
        },
      ],
    });
});

it("returns a 400 if the user provides an invalid title or price", async () => {
  const ticket = (await createTicket()).body;
  const newPayload = {};
  const res = await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set("Cookie", getCookie())
    .send(newPayload)
    .expect(400);
});

it("returns 200 if ticket is successfully updated", async () => {
  const ticket = (await createTicket()).body;

  const res = await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set("Cookie", getCookie())
    .send(newPayload)
    .expect(200);
  expect(res.body.title).toEqual(newPayload.title);
  expect(res.body.price).toEqual(newPayload.price);
});

it("returns 400 if ticket is locked", async () => {
  const userId = mongoose.Types.ObjectId().toHexString()
  const orderId = mongoose.Types.ObjectId().toHexString()
  const ticket = (await createTicket()).body;
  const savedTicket =await TicketModel.findById(ticket.id)
  savedTicket!.set({orderId})
  await savedTicket!.save()
  const {body} =  await request(app)
  .put(`/api/tickets/${savedTicket!.id}`)
  .set("Cookie", getCookie(savedTicket!.userId))
  .send({...newPayload})
  .expect(400)
  .expect({
    errors:[
      {
        message: 'Cannot edit a locked Ticket'
      }
    ]
  })
});

it('publishes a new event for ticket updation',async ()=>{
  const ticket = (await createTicket()).body;
  const res = await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set("Cookie", getCookie())
    .send(newPayload)
    .expect(200);
  expect(res.body.title).toEqual(newPayload.title);
  expect(res.body.price).toEqual(newPayload.price);
  expect(natsWrapper.client.publish).toHaveBeenCalled()
})