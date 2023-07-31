import { Router } from "express";
import { getRentals, postRental, closeRental, deleteRental } from "../controllers/rentals.controller.js";
import { validateSchema } from "../middlewares/validateSchema.js";
import { rentalsSchema } from "../schemas/rentals.schema.js";

const rentalsRouter = Router();

rentalsRouter.get("/rentals", getRentals);
rentalsRouter.post("/rentals", validateSchema(rentalsSchema), postRental);
rentalsRouter.post("/rentals/:id/return", closeRental);
rentalsRouter.delete("/rentals/:id", deleteRental);

export default rentalsRouter;
