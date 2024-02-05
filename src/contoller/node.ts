import { RequestHandler } from "express";
import Project, { ProjectDetailsInterface } from "../modals/Projects";
import Treatments, { TreatmentDetailsInterface } from "../modals/Treatments";

export const createProject: RequestHandler = async (req, res) => {
  try {
    const { userMail } = req.body;
    const existingProject = await Project.findOne({ userMail });

    if (!existingProject) {
      const newProject = await Project.create<ProjectDetailsInterface>({
        userMail: (req.body as ProjectDetailsInterface).userMail,
        projects: (req.body as ProjectDetailsInterface).projects,
      });

      const newTreatments = await Treatments.create<TreatmentDetailsInterface>({
        projectId: newProject.projects[0]._id,
        treatments: (req.body.projects as TreatmentDetailsInterface).treatments,
        replications: (req.body.projects as TreatmentDetailsInterface)
          .replications,
      });

      return res.json({
        response: "New Project Created",
        newTreatments,
        newProject,
      });
    } else {
      const updatedProject =
        await Project.findOneAndUpdate<ProjectDetailsInterface>(
          { userMail },
          {
            $push: {
              projects: (req.body as ProjectDetailsInterface).projects,
            },
          },
          { new: true }
        );

      if (updatedProject && updatedProject.projects) {
        const newTreatments =
          await Treatments.create<TreatmentDetailsInterface>({
            projectId: (
              updatedProject.projects[updatedProject.projects.length - 1] as any
            )._id,
            treatments: (
              updatedProject.projects[
                updatedProject.projects.length - 1
              ] as TreatmentDetailsInterface
            ).treatments,
            replications: (
              updatedProject.projects[
                updatedProject.projects.length - 1
              ] as TreatmentDetailsInterface
            ).replications,
          });

        return res.json({
          response: "Project updated",
          updatedProject,
        });
      } else {
        return res.status(404).json({
          response: "Project not found or missing projects data",
        });
      }
    }
  } catch (error: any) {
    return res.status(500).json({
      response: "Internal Server Error",
      error: error.message,
    });
  }
};

export const AddNotes: RequestHandler = async (req, res) => {
  try {
  } catch (error) {
    response: error;
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

export const GetAllProjects: RequestHandler = async (req, res) => {
  try {
    const projects = await Project.find();

    res.json({
      response: projects,
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
