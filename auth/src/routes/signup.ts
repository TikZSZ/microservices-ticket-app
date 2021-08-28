import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { body } from "express-validator";
import { UserModel } from "../models/UserModel";
import { UserEnum, BadRequestError,  AuthenticationBody, validateRequest } from "@tikzsztickets/common"

const router = Router();

interface RequestWithBody extends Request {
  body: AuthenticationBody;
}

router.post(
  "/api/users/signup",

  [
    body(UserEnum.email).isEmail().withMessage("Email must be valid"),
    body(UserEnum.password)
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters"),
    validateRequest,
  ],

  async (req: RequestWithBody, res: Response) => {
    const { email, password } = req.body;

    // User Exists?
    const existingUser = await UserModel.findOne({ email: email });
    if (existingUser) {
      throw new BadRequestError("Email Already In Use");
    }

    // Create User
    const user = await UserModel.create({ email, password });

    // Generate JWT
    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_KEY!
    );

    // Store it on session Object or send in cookie
    req.session = {
      jwt: userJwt,
    };

    res.status(201).send(user);
  }
);

export { router as signupRouter };
