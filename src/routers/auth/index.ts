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
import { CreateNewUser } from "../../contoller/UserController/CreateNewUser";
import {
  ResendVerificationEmail,
  VerifyEmail,
} from "../../contoller/VerifyEmail";

import { generateResetPasswordLink } from "../../contoller/UserController/ResetPassword";
import { grantValid } from "../../contoller/UserController/VerifyResetToken";
import { UpdatePassword } from "../../contoller/UserController/UpdatePassword";
import { SignIn } from "../../contoller/UserController/SignIn";
import { Logout } from "../../contoller/UserController/Logout";

const router = Router();

router.post("/createUser", validate(CreateUserSchema), CreateNewUser);
router.post("/verifyEmail", validate(TokenAndIdValidation), VerifyEmail);
router.post("/reVerifyEmail", ResendVerificationEmail);
router.post("/forgotPassword", generateResetPasswordLink);

router.post(
  "/verify-reset-password",
  validate(TokenAndIdValidation),
  verifyResetPasswordToken,
  grantValid
);

router.post(
  "/update-password",
  validate(PasswordCheckSchema),
  verifyResetPasswordToken,
  UpdatePassword
);

router.post("/sign-in", validate(LoginValidationSchema), SignIn);

router.get("/is-auth", verifyLoginToken, (req, res) => {
  res.status(200).json({
    profile: req.user,
  });
});

router.post("/log-out", verifyLoginToken, Logout)

export default router;
