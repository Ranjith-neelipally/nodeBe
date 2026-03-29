import { Router } from "express";
import {
  CreateUserSchema,
  TokenAndIdValidation,
  PasswordCheckSchema,
  LoginValidationSchema,
  ProfileVerificationCodeSchema,
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

AuthRouter.post("/signup", validate(CreateUserSchema), CreateNewUser);
AuthRouter.post("/verify-email", validate(ProfileVerificationCodeSchema), VerifyEmail);
AuthRouter.post("/resend-verification-email", validate(ProfileVerificationCodeSchema), ResendVerificationEmail);
AuthRouter.post("/forgot-password", GenerateResetPasswordLink);

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
