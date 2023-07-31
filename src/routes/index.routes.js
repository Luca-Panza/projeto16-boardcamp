import { Router } from "express";
import gamesRouter from "./games.routes.js";
import customersRouter from "./customers.routes.js";
import rentalsRouter from "./rentals.routes.js";

const indexRouter = Router();

indexRouter.use(gamesRouter);
indexRouter.use(customersRouter);
indexRouter.use(rentalsRouter);

export default indexRouter;
