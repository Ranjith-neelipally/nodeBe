import { Router } from "express";
import { CreateUserSchema } from "../../utils/validationsSchema";
import { validate } from "../../MiddleWare/Validator";
import { CreateNewUser } from "../../contoller/UserController/CreateNewUser";

const router = Router();

router.post("/createUser", validate(CreateUserSchema), CreateNewUser);

export default router;
