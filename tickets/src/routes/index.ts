import { Router, Request, Response } from "express";
import { TicketModel } from "../models/TicketsModel";

const router = Router();

router.get(
  "/api/tickets",
  async (req: Request, res: Response) => {
    const tickets = await  TicketModel.find({})
    res.status(200).send(tickets)
  }
);

export {router as indexTicketRouter}