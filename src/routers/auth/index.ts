import { Router } from "express";
import { CreateUserSchema } from "../../utils/validationsSchema";
import { validate } from "../../MiddleWare/Validator";
import { CreateNewUser } from "../../contoller/UserController/CreateNewUser";
import { VerifyEmail } from "../../contoller/VerifyEmail";

const router = Router();

router.post("/createUser", validate(CreateUserSchema), CreateNewUser);

router.post("/verify-email", VerifyEmail)

export default router;
