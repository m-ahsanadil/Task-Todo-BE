import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { encrypt } from "../../helper/helper";
import { UserResponse } from "../../dto/user.dto";
import ApiError from "../../utils/api-error";
import ApiResponse from "../../utils/api-response";
import { MESSAGES } from "../../utils/message-codes";
import { User } from "../../models/user.models";
import { sendOtpEmail, sendOtpPhone } from "../../../services/otp.service";
import { isUUID } from "class-validator";
import { v4 as uuidv4 } from "uuid";
import {
  UsersVerification,
  VerificationType,
} from "../../../models/member/auth/user-verification";
import { generateOtpWithExpiration } from "../../../utils/otp-helper";
import { Session } from "../../../models/member/auth/user-sessions.models";
import {  uploadToS3 } from "../../../services/s3.service";
import sharp from "sharp";
import { ValidationHelper } from "../../utils/validation.helper";
import { SelectedBrand } from "../../../models/member/selected-brands/selected-brands.models";
import { UserBrandInteraction } from "../../../models/member/brand-interaction/user-brand-interaction.models";

export class UserController {
 
  static async getUser(req: Request, res: Response) {
    const { userId } = (req as any).user;

    try {
      const userRepository = getRepository(User);
      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(MESSAGES.NOT_FOUND._CODE, null, "User not found"),
        });
      }

      const { password, rememberTokenExpiry, ...data } = user;

      return res
        .status(MESSAGES.SUCCESS._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            data,
            "User retrieved successfully."
          )
        );
    } catch (error) {
      return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
        error: new ApiError(
          MESSAGES.INTERNAL_SERVER_ERROR._CODE,
          null,
          MESSAGES.INTERNAL_SERVER_ERROR.message
        ),
      });
    }
  }
}
