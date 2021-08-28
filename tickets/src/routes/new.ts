import { Router, Request, Response } from "express";
import { body } from "express-validator";
import { requireAuth, validateRequest } from "@tikzsztickets/common";
import { TicketDoc, TicketModel } from "../models/TicketsModel";
import { TicketCreatedPublisher } from "../events/publishers/ticket-created-publisher";
import { natsWrapper } from "../nats-wrapper";
const router = Router();
enum newTicketEnum {
  title = "title",
  price = "price",
}

interface RequestBody extends Request {
  body: {
    title: string;
    price: number;
  };
}

router.post(
  "/api/tickets",
  [
    requireAuth,
    body(newTicketEnum.title).not().isEmpty().withMessage("Title is required"),
    body(newTicketEnum.price)
      .isFloat({ gt: 0 })
      .withMessage("Price must be greater than 0"),
    validateRequest,
  ],
  async (req: RequestBody, res: Response) => {
    const { title, price } = req.body;

    const ticket = TicketModel.build({
      title: title,
      price: price,
      userId: req.currentUser!.id,
    });

    await ticket.save();
    const { id, version, userId } = ticket;
    console.log(ticket ,'this is inside new route of ticket creation')
      await new TicketCreatedPublisher(natsWrapper.client).publish({
        id,
        version,
        title,
        price,
        userId,
      });
    res.status(201).send(ticket);
  }
);

export { router as createTicketRoute };

function PublishTicketCreatedEvent(ticket: TicketDoc): Promise<void> {
  return new Promise((resolve, reject) => {
    (async () => {
      const { id, version, title, price, userId } = ticket;
      await new TicketCreatedPublisher(natsWrapper.client).publish({
        id,
        version,
        title,
        price,
        userId,
      });
      resolve();
    })();
  });
}
