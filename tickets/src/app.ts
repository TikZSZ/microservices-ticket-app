import express from "express";
import "express-async-errors";
import {NotFoundError,errorHandler,currentUser} from "@tikzsztickets/common"
import cookieSession from "cookie-session";
import { createTicketRoute } from "./routes/new";
import { showTicketRoute } from "./routes/show";
import { indexTicketRouter } from "./routes";
import { updateTicketRoute } from "./routes/update";
const app = express();


app.set('trust proxy',true)
app.use(express.json());
app.use(cookieSession({
  signed: false,
  secure: process.env.NODE_ENV !==  'test'
}))
app.use(currentUser)
app.use(createTicketRoute)
app.use(showTicketRoute)
app.use(indexTicketRouter)
app.use(updateTicketRoute)
app.all("*", () => {
  throw new NotFoundError();
});
app.use(errorHandler);


export {app}

