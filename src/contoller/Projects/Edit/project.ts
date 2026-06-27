import { RequestHandler } from "express";
import { Projects } from "../../../modals/Projects";
import { Plots } from "../../../modals/Projects/Plots";
import { Project } from "src/@types/Projects";

export const EditProject: RequestHandler = async (req: Project, res) => {
  try {
    const {
      title,
      replications,
      treatments,
      location,
      _id,
    } = req.body;
    const userId = req.user.id;

    const project = await Projects.findOne({
      _id,
      userId,
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (typeof title === "string") {
      const existingTitle = await Projects.findOne({
        title,
        userId,
        _id: { $ne: project._id },
      });

      if (existingTitle) {
        return res.status(400).json({
          error: "Project title already exists",
        });
      }
    }

    const structureChanged =
      typeof replications === "number" || typeof treatments === "number";
    if (structureChanged) {
      const [maxReplicationPlot, maxTreatmentPlot] = await Promise.all([
        Plots.findOne({ projectId: project._id, userId }).sort({ replication: -1 }),
        Plots.findOne({ projectId: project._id, userId }).sort({ treatment: -1 }),
      ]);
      const nextReplications = replications ?? project.replicationsCount;
      const nextTreatments = treatments ?? project.treatmentsCount;

      if (
        nextReplications < (maxReplicationPlot?.replication || 0) ||
        nextTreatments < (maxTreatmentPlot?.treatment || 0)
      ) {
        return res.status(409).json({
          error: "Project structure cannot be reduced because plot deletion is not allowed.",
        });
      }
    }

    const update: Record<string, unknown> = {};
    if (typeof title === "string") update.title = title;
    if (typeof location === "string") update.location = location;
    if (typeof replications === "number") update.replicationsCount = replications;
    if (typeof treatments === "number") update.treatmentsCount = treatments;

    const newProject = await Projects.findOneAndUpdate(
      { _id: project._id, userId },
      { $set: update },
      { new: true },
    );
    return res.status(200).json({ newProject });
  } catch (error) {
    console.error("Error editing project:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
