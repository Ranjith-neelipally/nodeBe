import { RequestHandler } from "express";
import { Projects } from "../../../modals/Projects";
import { Project } from "src/@types/Projects";

export const EditProject: RequestHandler = async (req: Project, res) => {
  try {
    const {
      userId,
      title,
      replications,
      treatments,
      location,
      _id,
    } = req.body;

    const Project = await Projects.findOne({
      _id,
      userId,
    });

    if (!Project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const existingTitle = await Projects.findOne({
      title,
      userId,
      _id: { $ne: Project._id },
    });

    if (existingTitle) {
      return res.status(400).json({
        error: "Project title already exists",
      });
    }

    const newProject = await Projects.findByIdAndUpdate(
      Project._id,
      {
        $set: {
          title,
          replicationsCount: replications,
          treatmentsCount: treatments,
          location,
        },
      },
      { new: true }
    );
    res.status(201).json({ newProject });
  } catch (error) {
    console.error("Error creating project:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
