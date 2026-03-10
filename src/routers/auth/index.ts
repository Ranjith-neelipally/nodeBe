import { Router } from "express";
import {
  CreateUserSchema,
  TokenAndIdValidation,
  PasswordCheckSchema,
  LoginValidationSchema,
} from "../../utils/validationsSchema";
import { validate } from "../../MiddleWare/Validator";
import {
  verifyLoginToken,
  verifyResetPasswordToken,
} from "../../MiddleWare/auth";

import {
  CreateNewUser,
  GenerateResetPasswordLink,
  Logout,
  GetUser,
  ResendVerificationEmail,
  SignIn,
  UpdatePassword,
  VerifyEmail,
} from "../../contoller/UserController";

const AuthRouter = Router();

AuthRouter.get("/get-user", verifyLoginToken, GetUser);

AuthRouter.post("/sign-up", validate(CreateUserSchema), CreateNewUser);
AuthRouter.post("/verifyEmail", validate(TokenAndIdValidation), VerifyEmail);
AuthRouter.post("/reVerifyEmail", ResendVerificationEmail);
AuthRouter.post("/forgotPassword", GenerateResetPasswordLink);

AuthRouter.post(
  "/verify-reset-password",
  validate(TokenAndIdValidation),
  verifyResetPasswordToken
);

AuthRouter.post(
  "/update-password",
  validate(PasswordCheckSchema),
  verifyResetPasswordToken,
  UpdatePassword
);

AuthRouter.post("/sign-in", validate(LoginValidationSchema), SignIn);

AuthRouter.post("/log-out", verifyLoginToken, Logout);

export default AuthRouter;
