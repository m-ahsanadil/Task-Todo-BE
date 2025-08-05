import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { ValidationHelper } from "../../utils/validation.helper";
import { MESSAGES } from "../../utils/message-codes";
import ApiError from "../../utils/api-error";
import { encrypt } from "../../helper/helper";
import { User } from "../../models/user.models";
import { UserResponse } from "../../dto/user.dto";
import ApiResponse from "../../utils/api-response";

export class AuthController {
  static async createUser(req: Request, res: Response) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(MESSAGES.BAD_REQUEST._CODE).json({
        error: new ApiError(
          MESSAGES.BAD_REQUEST._CODE,
          null,
          "Full name, email, and password are required."
        ),
      });
    }

    try {
      const normalizedEmail = ValidationHelper.isValidEmail(email);

      if (!ValidationHelper.isValidPassword(password)) {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: new ApiError(
            MESSAGES.BAD_REQUEST._CODE,
            null,
            "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character (@)."
          ),
        });
      }
      const encryptedPassword = await encrypt.encryptPass(password);

      if (!encryptedPassword) {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: new ApiError(
            MESSAGES.BAD_REQUEST._CODE,
            null,
            "Password is not encrypting."
          ),
        });
      }

      const existingUser = await getRepository(User).findOne({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        return res.status(MESSAGES.CONFLICT._CODE).json({
          error: new ApiError(
            MESSAGES.CONFLICT._CODE,
            null,
            "Email address already exist"
          ),
        });
      }

      const user = new User();
      user.name = name;
      user.email = normalizedEmail;
      user.password = encryptedPassword;


      const userRepository = getRepository(User);
      await userRepository.save(user);


      const userSignup = {
        id: user.id,
        name: user.name,
        email: user.email,

      };

      return res

        .status(MESSAGES.CREATED._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            userSignup,
            `User created successfully`
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

  static async login(req: Request, res: Response) {
    const { email, password } =
      req.body;
    try {
      const normalizedEmail = ValidationHelper.isValidEmail(email);
      const userRepository = getRepository(User);


      let user;
      if (email) {
        user = await userRepository.findOneBy({ email: normalizedEmail });
      }

      if (!user) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "User not found."
          ),
        });
      }

      const isPasswordValid = encrypt.comparePassword(user.password, password);
      if (!isPasswordValid) {
        return res.status(MESSAGES.UNAUTHORIZED._CODE).json({
          error: new ApiError(
            MESSAGES.UNAUTHORIZED._CODE,
            null,
            MESSAGES.INCORRECT_CREDENTIALS.message
          ),
        });
      }

      const token = encrypt.generateToken<UserResponse>({
        id: String(user.id),
        name: user.name,
        email: user.email,
      });

      await userRepository.save(user);

      const userLogin = {
        id: user.id,
        name: user.name,
        email: user.email,
        token,
      };

      return res
        .status(MESSAGES.CREATED._CODE)
        .json(
          new ApiResponse(
            MESSAGES.SUCCESS._CODE,
            userLogin,
            "User login successfully"
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
