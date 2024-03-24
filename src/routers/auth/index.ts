import { Router } from "express";
import {
  CreateUserSchema,
  EmailVerifictionBody,
} from "../../utils/validationsSchema";
import { validate } from "../../MiddleWare/Validator";
import { CreateNewUser } from "../../contoller/UserController/CreateNewUser";
import {
  ResendVerificationEmail,
  VerifyEmail,
} from "../../contoller/VerifyEmail";

const router = Router();

router.post("/createUser", validate(CreateUserSchema), CreateNewUser);

router.post("/verifyEmail", validate(EmailVerifictionBody), VerifyEmail);
router.post("/reVerifyEmail", ResendVerificationEmail);

export default router;
