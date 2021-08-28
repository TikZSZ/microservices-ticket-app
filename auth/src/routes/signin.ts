import { Router,Request,Response } from "express";
import { body } from "express-validator";
import jwt from 'jsonwebtoken'
import { UserModel } from "../models/UserModel";
import { PasswordManager } from "../services/PasswordManager";
import { UserEnum, NotAuthorizedError,  AuthenticationBody, validateRequest } from "@tikzsztickets/common"

interface RequestWithBody extends Request {
  body: AuthenticationBody;
}
const router = Router();

router.post(
  "/api/users/signin",
  [
    body(UserEnum.email).isEmail().withMessage("Email must be valid"),
    body(UserEnum.password)
      .trim()
      .notEmpty()
      .withMessage("You must supply a password"),
    // check for errors in body
    validateRequest
  ],
  async (req:RequestWithBody , res:Response) => {
    // console.log(req.session?.jwt);
    
    const { email, password } = req.body;
    // User Exists?
    const existingUser = await UserModel.findOne({ email: email });
    if(!existingUser){
      throw new NotAuthorizedError()
    }

    // Is Supplied Password Correct?
    const passwordsMatch = await PasswordManager.compare(existingUser.password,password)

    if(!passwordsMatch){
      throw new NotAuthorizedError()
    }
    // Generate JWT
    const userJwt = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
      },
      process.env.JWT_KEY!
    );

    // Store it on session Object or send in cookie
    req.session = {
      jwt: userJwt,
    };

    res.status(200).send(existingUser)
  }
);

export { router as signinRouter };
