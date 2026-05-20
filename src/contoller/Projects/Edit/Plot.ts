import { RequestHandler } from "express";
import { Plot } from "src/@types/Projects";
import { Projects } from "../../../modals/Projects/index";
import { Plots } from "../../../modals/Projects/Plots";

export const EditPlot: RequestHandler = async (req: Plot, res) => {
  const {
    projectId,
    title,
    color,
    notesCount,
    replication,
    treatment,
    _id,
  } = req.body;
  const userId = req.user.id.toString();

  try {
    const project = await Projects.findOne({ _id: projectId, userId });
    const validPlot = await Plots.findOne({ projectId, _id, userId });

    if (!project) {
      return res.status(404).json({ error: "Project not found!" });
    }

    if (!validPlot) {
      return res.status(404).json({ error: "Plot not found!" });
    }
    const existingTitle = await Plots.findOne({
      title,
      userId,
      projectId,
      _id: { $ne: validPlot._id },
    });

    if (existingTitle) {
      return res.status(400).json({ error: "Plot title must be unique!" });
    }

    if (
      project.replicationsCount < replication ||
      project.treatmentsCount < treatment
    ) {
      return res.status(400).json({
        error: `Invalid ${
          project.replicationsCount < replication ? "replication" : "treatment"
        } number!`,
      });
    }

    const plot = await Plots.findByIdAndUpdate(
      validPlot._id,
      {
        $set: {
          title,
          color,
          replication,
          treatment,
          notesCount,
          plotIndex: [replication, treatment],
        },
      },
      { new: true }
    );

    return res.status(201).json({ plot });
  } catch (error) {
    return res.status(500).json(req.body);
  }
};
