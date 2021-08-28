import { Router, Request, Response } from "express";
import { param,body } from "express-validator";
import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
  validateRequest,
} from "@tikzsztickets/common";
import {  TicketDoc, TicketModel } from "../models/TicketsModel";
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publisher";
import { natsWrapper } from "../nats-wrapper";
import mongoose from 'mongoose'
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
  params: {
    id: string;
  };
}

router.put(
  "/api/tickets/:id",
  [ requireAuth,
    param("id")
      .exists()
      .withMessage("id is required"),
    body(newTicketEnum.title)
      .not()
      .isEmpty()
      .withMessage("Title is required"),
    body(newTicketEnum.price)
      .isFloat({ gt: 0 })
      .withMessage("Price must be greater than 0"),
    validateRequest,
  ],

  async (req: RequestBody, res: Response) => {
    const { id } = req.params;
    const {title,price} = req.body
    let ticket = await TicketModel.findById(id)
    if(!ticket){
      throw new NotFoundError()
    }
    if(ticket.userId !== req.currentUser!.id){
      throw new NotAuthorizedError()
    }

    if(ticket.orderId){
      throw new BadRequestError('Cannot edit a locked Ticket')
    }
    ticket.set({
      title:title,
      price:price,
    })
    await ticket.save()
    const { version, userId,orderId } = ticket;
      await new TicketUpdatedPublisher(natsWrapper.client).publish({
        id,
        version,
        title,
        price,
        userId,
        orderId
      });
    res.status(200).send(ticket);
  }
);

export { router as updateTicketRoute };

function PublishTicketUpdatedEvent(ticket: TicketDoc): Promise<void> {
  return new Promise((resolve, reject) => {
    (async () => {
      const { id, version, title, price, userId } = ticket;
      await new TicketUpdatedPublisher(natsWrapper.client).publish({
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
