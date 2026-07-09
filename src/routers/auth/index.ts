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
  emailAuthRateLimit,
  loginRateLimit,
  passwordResetRateLimit,
  refreshRateLimit,
} from "../../MiddleWare/rateLimit";

import {
  CreateNewUser,
  GenerateResetPasswordLink,
  Logout,
  GetUser,
  Refresh,
  ResendVerificationEmail,
  SignIn,
  UpdatePassword,
  VerifyEmail,
} from "../../contoller/UserController";
import { sendSuccess } from "../../utils/apiResponse";

const AuthRouter = Router();

AuthRouter.get("/get-user", verifyLoginToken, GetUser);

AuthRouter.post("/signup", validate(CreateUserSchema), CreateNewUser);
AuthRouter.post("/verify-email", emailAuthRateLimit, validate(ProfileVerificationCodeSchema), VerifyEmail);
AuthRouter.post("/resend-verification-email", emailAuthRateLimit, ResendVerificationEmail);
AuthRouter.post("/forgot-password", passwordResetRateLimit, GenerateResetPasswordLink);

AuthRouter.post(
  "/verify-reset-password",
  passwordResetRateLimit,
  validate(TokenAndIdValidation),
  verifyResetPasswordToken,
  (req, res) => sendSuccess(res, null, 200, "Token is valid"),
);

AuthRouter.post(
  "/update-password",
  passwordResetRateLimit,
  validate(PasswordCheckSchema),
  verifyResetPasswordToken,
  UpdatePassword
);

AuthRouter.post("/login", loginRateLimit, validate(LoginValidationSchema), SignIn);
AuthRouter.post("/sign-in", loginRateLimit, validate(LoginValidationSchema), SignIn);
AuthRouter.post("/refresh", refreshRateLimit, Refresh);

AuthRouter.post("/logout", verifyLoginToken, Logout);
AuthRouter.post("/log-out", verifyLoginToken, Logout);

export default AuthRouter;
