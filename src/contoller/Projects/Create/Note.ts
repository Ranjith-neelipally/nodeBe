import { RequestHandler } from "express";
import { Note } from "src/@types/Projects";
import { PlotNotes } from "../../../modals/Projects/Notes";
import { Plots } from "../../../modals/Projects/Plots";

export const CreateNote: RequestHandler = async (req: Note, res) => {
  try {
    const { projectId, plotId, userId, content } = req.body;

    const validPlot = await Plots.findOne({
      _id: plotId,
      projectId: projectId,
    });

    if (!validPlot) {
      return res
        .status(400)
        .json({ error: "Invalid plot for the specified project." });
    }

    const doc = await PlotNotes.create({
      projectId,
      plotId,
      userId,
      content,
    });

    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
