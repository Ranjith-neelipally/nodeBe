import { Router } from "express";
import { CreateNewProject } from "../../contoller/Projects";

const ProjectsRouter = Router();

ProjectsRouter.post("/create-new", CreateNewProject);

export default ProjectsRouter;
