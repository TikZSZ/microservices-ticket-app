import { Router, Request, Response } from "express";
import { param } from "express-validator";
import {
  NotFoundError,
  validateRequest,
} from "@tikzsztickets/common";
import { TicketDoc, TicketModel } from "../models/TicketsModel";

const router = Router();
enum newTicketEnum {
  title = "title",
  price = "price",
}

interface RequestBody extends Request {
  params: {
    id: string;
  };
}

router.get(
  "/api/tickets/:id",
  [
    param("id").exists().withMessage("id is required"),
    validateRequest,
  ],
  async (req: RequestBody, res: Response) => {
    const { id } = req.params;
    let existingTicket: TicketDoc | null = null;

    // if the id is like ObjectId mongoose throws a error

    existingTicket = await TicketModel.findById(id);
    if (!existingTicket) {
      throw new NotFoundError();
    }
    res.status(200).send(existingTicket);
  }
);

export { router as showTicketRoute };
