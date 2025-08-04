import express from "express";
import { TodoDashboardController } from "../controllers/todo-dashboard/todo-dashboard.controller";
import { authentication } from "../middleware/auth.middleware";

const Router = express.Router();

Router.use(authentication);
Router.get("/", TodoDashboardController.getUserTodos);
Router.post("/", TodoDashboardController.createTodo);
Router.put("/:id", TodoDashboardController.updateTodo);
Router.delete("/:id", TodoDashboardController.deleteTodo);

export { Router as todoRouter };
