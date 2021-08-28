import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from "@tikzsztickets/common";
import { Router, Request, Response } from "express";
import { body } from "express-validator";
import mongoose from "mongoose";
import { OrderModel } from "../models/OrdersModel";
import { TicketModel } from "../models/TicketsModel";
import { OrderCreatedPublisher } from "../events/publisher/order-created-publisher";
import { natsWrapper } from "../nats-wrapper";
const router = Router();

const EXPIRATION_WINDOW_SECONDS = 2*60  //15 * 60;

interface RequestWithBody extends Request {
  body: {
    ticketId: string;
  };
}

router.post(
  "/api/orders",
  [
    requireAuth,
    body("ticketId")
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))     
      .withMessage("TicketId must be provided"),
    validateRequest,
  ],
  async (req: RequestWithBody, res: Response) => {
    const { ticketId } = req.body;

    // Find the ticket the user is trying to order in the database
    const existingTicket = await TicketModel.findById(ticketId);

    //Throw Error if ticket does not exist
    if (!existingTicket) {
      throw new NotFoundError();
    }

    // Make sure that this existingTicket is not already reserved
    const isReserved = await existingTicket.isReserved();
    if (isReserved) {
      throw new BadRequestError("Ticket is already reserved");
    }

    // Calculate an expiration date for this order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);


    // Build the order and save it to the database
    const order = OrderModel.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket: existingTicket,
    });
    await order.save();

    //Publish order created event
    const orderCreatedPublisher = new OrderCreatedPublisher(natsWrapper.client)
    
    const {id,version,expiresAt,userId, ticket} = order

    await orderCreatedPublisher.publish({
      orderId:id,
      version:version,
      status: OrderStatus.Created,
      expiresAt: expiresAt.toISOString(),
      ticket:{
        ticketId: ticket.id,
        price: ticket.price
      }
    })
    res.status(201).send(order);
  }
);

export { router as newOrderRouter };
