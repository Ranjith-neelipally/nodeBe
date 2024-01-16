import express from "express";
import "./db";
import Project, { ProjectDetailsInterface } from "./modals/Projects";
import NewNote, { NotesInterface } from "./modals/NewNote";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("<h1>hello world</h1>");
});

app.post("/", (req, res) => {
  res.json({
    message: "hello",
  });
  console.log(req.body, "reques form");
});

app.post("/createNewProject", async (req, res) => {
  await Project.create<ProjectDetailsInterface>({
    _id: (req.body as ProjectDetailsInterface)._id,
    projectTitle: (req.body as ProjectDetailsInterface).projectTitle,
    location: (req.body as ProjectDetailsInterface).location,
    replications: (req.body as ProjectDetailsInterface).replications,
    treatments: (req.body as ProjectDetailsInterface).treatments,
    notes: (req.body as ProjectDetailsInterface).notes,
  });

  res.json({
    response: "New Project Created",
  });
});

app.post("/createNewNote", async (req, res) => {
  await NewNote.create<NotesInterface>({
    ProjectId: (req.body as NotesInterface).ProjectId,
    NoteId: (req.body as NotesInterface).NoteId,
    NoteDate: (req.body as NotesInterface).NoteDate,
    Note: (req.body as NotesInterface).Note,
  });

  res.json({
    response: "new Note Created",
  });
});

app.get("/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const ProjectName = await Project.findById(projectId);
    res.json({
      response: ProjectName,
    });
  } catch (error) {
    res.json({
      response: error,
    });
  }
});

app.post("/PatchNote/:projectid", async (req, response) => {
  try {
    const { projectid } = req.params;
    const { notes } = req.body as ProjectDetailsInterface;

    const updatedProject = await Project.findByIdAndUpdate(
      projectid,
      { $set: { notes: notes.map((note) => ({ noteString: note.noteString })) } },
      { new: true }
    );

    if (updatedProject) {
      response.json({
        response: "Note updated successfully",
        project: updatedProject,
      });
    } else {
      response.status(404).json({
        response: "Project not found",
      });
    }
  }  catch (error) {
    response.json({
      response: error,
    });
  }
});


app.listen(1430, () => {
  console.log("listening");
});
