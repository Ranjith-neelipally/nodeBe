import { Router } from "express";
import {
  CreateNewProject,
  CreateNote,
  CreatePlots,
  EditNote,
  EditPlot,
  EditProject,
  DeleteProject,
  DeletePlot,
  DeleteNote,
  GetAllProjects,
  GetAllPlots,
  GetNotes,
  GetAllPhotos,
  CheckProjectTitleExists,
} from "../../contoller/Projects";
import {
  CreateProjectSchema,
  CreateNoteSchema,
  CreatePlotSchema,
  EditProjectSchema,
  EditPlotSchema,
  EditNoteSchema,
  DeleteProjectSchema,
  DeletePlotSchema,
  DeleteNoteSchema,
  GetAllProjectsSchema,
  CheckProjectTitleExistsSchema,
  GetAllPlotsSchema,
  GetNoteSchema,
} from "../../Schema/Projects";
import { validate } from "../../MiddleWare/Validator";

const projectsRouter = Router();

projectsRouter.post("", validate(CreateProjectSchema), CreateNewProject);
projectsRouter.post("/plot", validate(CreatePlotSchema), CreatePlots);
projectsRouter.post("/note", validate(CreateNoteSchema), CreateNote);

projectsRouter.patch("", validate(EditProjectSchema), EditProject);
projectsRouter.patch("/plot", validate(EditPlotSchema), EditPlot);
projectsRouter.patch("/note", validate(EditNoteSchema), EditNote);

projectsRouter.delete("", validate(DeleteProjectSchema), DeleteProject);
projectsRouter.delete("/plot", validate(DeletePlotSchema), DeletePlot);
projectsRouter.delete("/note", validate(DeleteNoteSchema), DeleteNote);

projectsRouter.get("", validate(GetAllProjectsSchema), GetAllProjects);
projectsRouter.get(
  "/title-exists",
  validate(CheckProjectTitleExistsSchema),
  CheckProjectTitleExists
);
projectsRouter.get("/plot", validate(GetAllPlotsSchema), GetAllPlots);
projectsRouter.get("/note", validate(GetNoteSchema), GetNotes);
projectsRouter.get("/photos", GetAllPhotos);

export default projectsRouter;
