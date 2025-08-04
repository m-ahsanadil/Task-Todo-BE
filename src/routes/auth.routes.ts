import express from "express";
import { AuthController } from "../controllers/auth/auth.controller";

const Router = express.Router();

Router.post("/register", AuthController.createUser);
Router.post("login", AuthController.login);

export { Router as authRouter };
