import { Router } from "express";
import gamesRouter from "./games.routes.js";
import customersRouter from "./customers.routes.js";

const indexRouter = Router();

indexRouter.use(gamesRouter);
indexRouter.use(customersRouter);

export default indexRouter;
