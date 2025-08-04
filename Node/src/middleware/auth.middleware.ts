import { NextFunction, Request, Response } from "express";
import ApiError from "../utils/api-error";
import { MESSAGES } from "../utils/message-codes";
import config from "../config";
import { getRepository } from "typeorm";
import { encrypt } from "../helper/helper";
import { User } from "../models/user.models";

declare global {
  namespace Express {
    interface Request {
      user?: { userId: string };
    }
  }
}

const SECRET_KEY = config.jwt.JWT_SECRET;

async function getUser(id: string) {
  return await getRepository(User).findOne({ where: { id: Number(id) } });
}

export const authentication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!SECRET_KEY) {
    throw new Error("SECRET_KEY is not defined");
  }

  const header = req.headers.authorization;
  if (!header) {
    return res.status(MESSAGES.UNAUTHORIZED._CODE).json({
      error: new ApiError(
        MESSAGES.UNAUTHORIZED._CODE,
        null,
        MESSAGES.UNAUTHORIZED.message + ": No header.."
      ),
    });
  }
  const token = header.split(" ")[1];
  if (!token) {
    return res.status(MESSAGES.UNAUTHORIZED._CODE).json({
      error: new ApiError(
        MESSAGES.UNAUTHORIZED._CODE,
        null,
        MESSAGES.UNAUTHORIZED.message + ": No bearer"
      ),
    });
  }
  try {
    const decoded = encrypt.verifyToken<{ id: string; role: string }>(token);
    if (!decoded) {
      return res.status(MESSAGES.UNAUTHORIZED._CODE).json({
        error: new ApiError(
          MESSAGES.UNAUTHORIZED._CODE,
          null,
          MESSAGES.UNAUTHORIZED.message + ": Invalid JWT token"
        ),
      });
    }

    const { id } = decoded;
    const user = await getUser(id);
    console.log("user: ", user);

    if (!user) {
      return res.status(MESSAGES.UNAUTHORIZED._CODE).json({
        error: new ApiError(
          MESSAGES.UNAUTHORIZED._CODE,
          null,
          `${MESSAGES.UNAUTHORIZED.message}: User not found`
        ),
      });
    }

    req.user = { userId: id };
  } catch (e) {
    return res.status(MESSAGES.UNAUTHORIZED._CODE).json({
      error: new ApiError(
        MESSAGES.UNAUTHORIZED._CODE,
        null,
        MESSAGES.UNAUTHORIZED.message + ": Error"
      ),
    });
  }
  next();
};

