import express from "express";
import "dotenv/config";
import "./db";
import {
  EditProjectDate,
  FindProject,
  createProject,
  DeleteProject,
  DeleteNote,
  EditNote,
  GetAllProjects,
  AddNotes,
} from "./contoller/node";

import {AuthRouter, ProjectsRouter} from "./routers";
import path from "path";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("src/public"));
app.use(express.static("src/public/reset-password.html"));

app.use("/auth", AuthRouter);
app.use("/projects", ProjectsRouter)

app.get("/", (req, res) => {
  res.sendFile(
    path.join(
      "/Users/rajithkumarreddyneelipally/ResearchPal/nodeBe/src/Public/index.html"
    )
  );
});

app.patch("/createNewProject", createProject);

app.patch("/AddNotes", AddNotes);

app.get("/getProject/:projectId", FindProject);

app.get("/getAllProjects", GetAllProjects);

app.get("/getNotes/:projectid/:noteId");

app.patch("/EditProjectData/:projectid/:field", EditProjectDate);

app.delete("/deteteProject/:projectId", DeleteProject);

app.delete("/deleteNote/:projectId/:noteId", DeleteNote);

app.patch("/editNote/:projectId/:noteId", EditNote);

app.listen(1430, () => {
  console.log("listening to port and");
});
