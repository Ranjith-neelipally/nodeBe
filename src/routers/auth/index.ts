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
  ResendVerificationEmail,
  SignIn,
  UpdatePassword,
  VerifyEmail,
} from "../../contoller/UserController";

const AuthRouter = Router();

AuthRouter.post("/createUser", validate(CreateUserSchema), CreateNewUser);
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

AuthRouter.get("/is-auth", verifyLoginToken, (req, res) => {
  res.status(200).json({
    profile: req.user,
  });
});

AuthRouter.post("/log-out", verifyLoginToken, Logout);

export default AuthRouter;
