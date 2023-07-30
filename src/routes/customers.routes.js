import { Router } from "express";
import { getCustomers, getCustomerById, postCustomer, updateCustomer } from "../controllers/customers.controller.js";
import { validateSchema } from "../middlewares/validateSchema.js";
import { customersSchema } from "../schemas/customers.schema.js";

const customersRouter = Router();

customersRouter.get("/customers", getCustomers);
customersRouter.get("/customers/:id", getCustomerById);
customersRouter.post("/customers", validateSchema(customersSchema), postCustomer);
customersRouter.put("/customers/:id", validateSchema(customersSchema), updateCustomer);

export default customersRouter;
