import { RequestHandler } from "express";
import Project, { ProjectDetailsInterface } from "../modals/Projects";

export const createProject: RequestHandler = async (req, res) => {
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
      response: error,
    });
  }
};

export const FindProject: RequestHandler = async (req, res) => {
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
};

export const EditProjectDate: RequestHandler = async (req, response) => {
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
};

export const DeleteProject: RequestHandler = async (req, res) => {
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
};

export const DeleteNote: RequestHandler = async (req, res) => {
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
};

export const EditNote: RequestHandler = async (req, res) => {
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
};

