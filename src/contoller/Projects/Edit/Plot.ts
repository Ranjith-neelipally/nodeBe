import { RequestHandler } from "express";
import { Plot } from "src/@types/Projects";
import { Plots } from "../../../modals/Projects/Plots";

export const EditPlot: RequestHandler = async (req: Plot, res) => {
  const { projectId, title, _id } = req.body;
  const userId = req.user.id.toString();

  try {
    const validPlot = await Plots.findOne({ projectId, _id, userId });

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

    const plot = await Plots.findOneAndUpdate(
      { _id: validPlot._id, projectId, userId },
      { $set: { title } },
      { new: true }
    );

    return res.status(201).json({ plot });
  } catch (error) {
    return res.status(500).json(req.body);
  }
};
