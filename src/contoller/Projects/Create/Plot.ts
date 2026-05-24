import { RequestHandler } from "express";
import { Projects } from "../../../modals/Projects/index";
import { Plots } from "../../../modals/Projects/Plots";

export const CreatePlots: RequestHandler = async (req, res) => {
  const userId = req.user.id.toString();
  const { projectId, plots } = req.body;
  let project: any = null;

  if (!Array.isArray(plots) || plots.length === 0) {
    return res.status(400).json({ error: "No plots provided" });
  }

  try {
    project = await Projects.findOne({ _id: projectId, userId });
    if (!project) {
      return res.status(404).json({ error: "Project not found!" });
    }

    // Fetch all existing plots for this project only
    const existingPlots = await Plots.find({ projectId });
    const existingTitles = new Set(existingPlots.map((p: any) => p.title));
    const existingIndexes = new Set(
      existingPlots.map((p: any) => JSON.stringify(p.plotIndex))
    );
    const shouldRollbackProject = existingPlots.length === 0;

    const rollbackProject = async () => {
      if (!project?._id || !shouldRollbackProject) return;
      await Projects.deleteOne({ _id: project._id });
    };

    // Check for duplicates in the incoming batch (within the batch only)
    const batchTitles = new Set();
    const batchIndexes = new Set();
    for (const plot of plots) {
      // Uniqueness within the batch
      if (batchTitles.has(plot.title)) {
        await rollbackProject();
        return res
          .status(400)
          .json({ error: `Duplicate plot title in request: ${plot.title}` });
      }
      if (batchIndexes.has(JSON.stringify(plot.plotIndex))) {
        await rollbackProject();
        return res.status(400).json({
          error: `Duplicate plotIndex in request: [${plot.plotIndex}]`,
        });
      }
      batchTitles.add(plot.title);
      batchIndexes.add(JSON.stringify(plot.plotIndex));

      // Uniqueness against DB (within the same project only)
      if (existingTitles.has(plot.title)) {
        await rollbackProject();
        return res.status(400).json({
          error: `Plot title must be unique within this project: ${plot.title}`,
        });
      }
      if (existingIndexes.has(JSON.stringify(plot.plotIndex))) {
        await rollbackProject();
        return res.status(400).json({
          error: `plotIndex must be unique within this project: [${plot.plotIndex}]`,
        });
      }

      // Replication/treatment bounds
      if (
        project.replicationsCount < plot.replication ||
        project.treatmentsCount < plot.treatment
      ) {
        await rollbackProject();
        return res.status(400).json({
          error: `Invalid ${
            project.replicationsCount < plot.replication
              ? "replication"
              : "treatment"
          } number for plot: ${plot.title} ${
            project.replicationsCount < plot.replication
              ? `(max ${project.replicationsCount})`
              : `(max ${project.treatmentsCount})`
          }`,
        });
      }
    }

    const plotsToInsert = plots.map((plot: any) => ({
      ...plot,
      projectId,
      userId,
    }));

    const createdPlots = await Plots.insertMany(plotsToInsert);
    return res.status(201).json({ plots: createdPlots });
  } catch (error) {
    if (project?._id && projectId) {
      try {
        const existingPlotsCount = await Plots.countDocuments({ projectId });
        if (existingPlotsCount === 0) {
          await Projects.deleteOne({ _id: project._id });
        }
      } catch {}
    }

    let errorMessage = "Unknown error";
    if (error && typeof error === "object" && "message" in error) {
      errorMessage = (error as any).message;
    } else if (typeof error === "string") {
      errorMessage = error;
    } else {
      try {
        errorMessage = JSON.stringify(error);
      } catch {}
    }
    return res.status(500).json({ error: errorMessage, data: req.body });
  }
};
