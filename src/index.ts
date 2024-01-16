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

app.patch("/EditProjectData/:projectid/:field", async (req, response) => {
  try {
    const { projectid, field } = req.params;
    const updateData = req.body;

    // Ensure that the field is a valid field in your Project model
    const validFields = [
      "projectTitle",
      "location",
      "replications",
      "treatments",
      "notes",
    ];
    if (!validFields.includes(field)) {
      return response.status(400).json({
        response: "Invalid field specified",
      });
    }

    let updatedProject;

    if (field === "notes") {
      // Handle updating notes separately
      const { notes } = updateData as ProjectDetailsInterface;
      updatedProject = await Project.findByIdAndUpdate(
        projectid,
        {
          $push: {
            notes: {
              $each: notes.map((note) => ({ noteString: note.noteString })),
            },
          },
        },
        { new: true }
      );
    } else {
      // Update the specified field
      const updateObj = { [field]: updateData[field] };
      updatedProject = await Project.findByIdAndUpdate(projectid, updateObj, {
        new: true,
      });
    }

    if (updatedProject) {
      response.json({
        response: "Project updated successfully",
        project: updatedProject,
      });
    } else {
      response.status(404).json({
        response: "Project not found",
      });
    }
  } catch (error:any) {
    response.status(500).json({
      response: error.message,
    });
  }
});


app.listen(1430, () => {
  console.log("listening");
});
