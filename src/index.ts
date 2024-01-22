import express from "express";
import "./db";
import Project, { ProjectDetailsInterface } from "./modals/Projects";

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
  try {
    await Project.create<ProjectDetailsInterface>({
      projectTitle: (req.body as ProjectDetailsInterface).projectTitle,
      location: (req.body as ProjectDetailsInterface).location,
      replications: (req.body as ProjectDetailsInterface).replications,
      treatments: (req.body as ProjectDetailsInterface).treatments,
      notes: (req.body as ProjectDetailsInterface).notes,
    });
  
    res.json({
      response: "New Project Created",
    });
    
  } catch (error) {
    res.json({
      response: error
    })
  }
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

app.get("/getNotes/:projectid/:noteId", async (req, response) => {
  try {
    const { projectid, noteId } = req.params;
    const ProjectName = await Project.findById(projectid);
    if (ProjectName) {
      const NoteDetails = ProjectName.notes.find(
        (note) => String(note._id) === noteId
      );
      if (NoteDetails) {
        response.json({
          note: NoteDetails,
        });
      } else {
        response.json({
          response: "no Note found",
        });
      }
    } else {
      response.json({
        response: "no project found",
      });
    }
  } catch (error) {
    response.json({
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
              $each: notes.map((note) => ({
                noteString: note.noteString,
                photoString:note.photoString,
              })),
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
  } catch (error: any) {
    response.status(500).json({
      response: error.message,
    });
  }
});

app.delete("/deteteProject/:projectId", async (req, res) => {
  const projectId = req.params.projectId;
  try {
    const deletedProject = await Project.findByIdAndDelete(projectId);
    if (deletedProject) {
      res.json({
        response: projectId + "deleted",
      });
    } else {
      res.json({
        response: "no project founnd with the name " + projectId,
      });
    }
  } catch (error) {
    res.json({
      response: "No Project Exist with that id",
    });
  }
});

app.delete("/deleteNote/:projectId/:noteId", async (req, res) => {
  try {
    const { noteId, projectId } = req.params;
    const project = await Project.findById(projectId);

    if (project) {
      const noteDetails = project.notes.find(
        (note) => String(note._id) === noteId.toString()
      );

      if (noteDetails) {
        project.notes.pull(noteDetails);
        await project.save();

        res.json({
          response: "Note deleted successfully",
        });
      } else {
        res.status(404).json({
          response: "Note not found",
        });
      }
    } else {
      res.status(404).json({
        response: "Project not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      response: error,
    });
  }
});

app.patch("/editNote/:projectId/:noteId", async (req, res) => {
  const { noteId, projectId } = req.params;
  const { noteString: UpdatedNotesString } = req.body;
  try {
    const UpdatedNote = await Project.updateOne(
      {
        _id: projectId,
        "notes._id": noteId,
      },
      { $set: { "notes.$.noteString": UpdatedNotesString } }
    );

    if (UpdatedNote) {
      res.json({
        response: "note Updated",
      });
    } else {
      res.json({
        response: "error",
      });
    }
  } catch (error) {
    res.json({
      response: error,
    });
  }
});

app.listen(1430, () => {
  console.log("listening");
});
