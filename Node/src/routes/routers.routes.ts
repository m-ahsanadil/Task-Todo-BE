import express from "express";
import { authRouter } from "./auth.routes";
import { todoRouter } from "./todo.routes";

const router = express.Router();

const apiPrefix = "/api/v1";

router.use(`${apiPrefix}`, authRouter);
router.use(`${apiPrefix}/todos`, todoRouter);

export default router;
