import { Router } from "express";
import {
  CreateNewIdea,
  EditIdea,
  GetIdea,
  DeleteIdea,
} from "../../contoller/Ideas";
import { validate } from "../../MiddleWare/Validator";
import {
  CreateIdeaSchema,
  editIdeaSchema,
  GetIdeaSchema,
  DeleteIdeaSchema,
} from "../../utils/validationsSchema";

const IdeasRouter = Router();

IdeasRouter.post("", validate(CreateIdeaSchema), CreateNewIdea);

IdeasRouter.patch("", validate(editIdeaSchema), EditIdea);
IdeasRouter.get("", validate(GetIdeaSchema), GetIdea);
IdeasRouter.delete("", validate(DeleteIdeaSchema), DeleteIdea);

export default IdeasRouter;
