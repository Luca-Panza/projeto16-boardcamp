import { Router } from "express";
import { getGames, postGame } from "../controllers/games.controller.js";
import { validateSchema } from "../middlewares/validateSchema.js";
import { gamesSchema } from "../schemas/games.schema.js";

const gamesRouter = Router();

gamesRouter.get("/games", getGames);
gamesRouter.post("/games", validateSchema(gamesSchema), postGame);

export default gamesRouter;
