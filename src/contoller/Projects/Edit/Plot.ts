import { RequestHandler } from "express";
import { Plot } from "src/@types/Projects";
import { Plots } from "../../../modals/Projects/Plots";

export const EditPlot: RequestHandler = async (req: Plot, res) => {
  const { projectId, title, _id, replicationName, treatmentName } = req.body;
  const userId = req.user.id.toString();

  try {
    const validPlot = await Plots.findOne({ projectId, _id, userId });

    if (!validPlot) {
      return res.status(404).json({ error: "Plot not found!" });
    }
    const setUpdate: Record<string, string> = {};
    const unsetUpdate: Record<string, string> = {};
    if (typeof title === "string") {
      const nextTitle = title.trim();
      if (nextTitle) {
        const existingTitle = await Plots.findOne({
          title: nextTitle,
          userId,
          projectId,
          _id: { $ne: validPlot._id },
        });

        if (existingTitle) {
          return res.status(400).json({ error: "Plot title must be unique!" });
        }

        setUpdate.title = nextTitle;
      }
    }
    if (typeof replicationName === "string") {
      const nextReplicationName = replicationName.trim();
      if (nextReplicationName) setUpdate.replicationName = nextReplicationName;
      else unsetUpdate.replicationName = "";
    }
    if (typeof treatmentName === "string") {
      const nextTreatmentName = treatmentName.trim();
      if (nextTreatmentName) setUpdate.treatmentName = nextTreatmentName;
      else unsetUpdate.treatmentName = "";
    }

    const update =
      Object.keys(unsetUpdate).length > 0
        ? { $set: setUpdate, $unset: unsetUpdate }
        : { $set: setUpdate };

    const plot = await Plots.findOneAndUpdate(
      { _id: validPlot._id, projectId, userId },
      update,
      { new: true }
    );

    return res.status(201).json({ plot });
  } catch (error) {
    return res.status(500).json(req.body);
  }
};
