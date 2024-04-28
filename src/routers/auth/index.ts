import { Router } from "express";
import {
  CreateUserSchema,
  TokenAndIdValidation,
  PasswordCheckSchema,
} from "../../utils/validationsSchema";
import { validate } from "../../MiddleWare/Validator";
import { verifyResetPasswordToken } from "../../MiddleWare/auth";
import { CreateNewUser } from "../../contoller/UserController/CreateNewUser";
import {
  ResendVerificationEmail,
  VerifyEmail,
} from "../../contoller/VerifyEmail";

import { generateResetPasswordLink } from "../../contoller/UserController/ResetPassword";
import { grantValid } from "../../contoller/UserController/VerifyResetToken";
import { UpdatePassword } from "../../contoller/UserController/UpdatePassword";

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

export default router;
