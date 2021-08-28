import request from "supertest";
import { app } from "../../app";
import { TicketModel } from "../../models/TicketsModel";
import { natsWrapper } from "../../nats-wrapper";

it("it true if the route exists", async () => {
  const response = await request(app).post("/api/tickets").send({});
  expect(response.statusCode).not.toEqual(404);
});

it("can only be access if the user is signed in", async () => {
  await request(app).post("/api/tickets").send({}).expect(401);
});

it("returns a status other than 401 if the user is signed in", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", getCookie());
  expect(response.statusCode).not.toEqual(401);
});

it("returns an error if an an invalid title is provided", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", getCookie())
    .send({
      title: "",
      price: 10,
    })
    .expect(400)
    .expect({
      errors: [
        {
          field: "title",
          message: "Title is required",
        },
      ],
    });

  await request(app)
    .post("/api/tickets")
    .set("Cookie", getCookie())
    .send({
      price: 10,
    })
    .expect(400)
    .expect({
      errors: [
        {
          field: "title",
          message: "Title is required",
        },
      ],
    });
});

it("returns an error if an an invalid price is provided", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", getCookie())
    .send({
      title: "string",
      price: -10,
    })
    .expect({
      errors: [
        {
          field: "price",
          message: "Price must be greater than 0",
        },
      ],
    });
  await request(app)
    .post("/api/tickets")
    .set("Cookie", getCookie())
    .send({
      title: "string",
    })
    .expect({
      errors: [
        {
          field: "price",
          message: "Price must be greater than 0",
        },
      ],
    });
});

it("creates a ticket with valid inputs", async () => {
  let tickets = await TicketModel.find({});

  expect(tickets.length).toEqual(0);

  const title = "string";

  const res = await request(app)
    .post("/api/tickets")
    .set("Cookie", getCookie())
    .send({
      title,
      price: 10,
    })
    .expect(201);
    
  tickets = await TicketModel.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].price).toEqual(10);
  expect(tickets[0].title).toEqual(title);
});


it('publishes a event for ticket creation',async ()=>{
  let tickets = await TicketModel.find({});

  expect(tickets.length).toEqual(0);

  const title = "string";

  const res = await request(app)
    .post("/api/tickets")
    .set("Cookie", getCookie())
    .send({
      title,
      price: 10,
    })
    .expect(201);
    
  tickets = await TicketModel.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].price).toEqual(10);
  expect(tickets[0].title).toEqual(title);
  expect(natsWrapper.client.publish).toHaveBeenCalled()
})