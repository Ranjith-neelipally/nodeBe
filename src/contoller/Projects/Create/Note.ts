import { RequestHandler } from "express";

import { PlotNotes } from "../../../modals/Projects/Notes";
import { Plots } from "../../../modals/Projects/Plots";
import { Projects } from "../../../modals/Projects";

export const CreateNote: RequestHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const { projectId, plotId, content, photoIds, title } = req.body;

    const validPlot = await Plots.findOne({
      _id: plotId,
      projectId: projectId,
      userId,
    });

    if (!validPlot) {
      return res
        .status(400)
        .json({ error: "Invalid plot for the specified project." });
    }

    // Create a new note document for each note
    const newNote = await PlotNotes.create({
      projectId,
      plotId,
      userId,
      title: title || "",
      content: [{
        note: Array.isArray(content) ? content : [content],
        photoIds: Array.isArray(photoIds) ? photoIds : []
      }],
    });

    await Promise.all([
      Plots.findOneAndUpdate({ _id: plotId, projectId, userId }, { $inc: { notesCount: 1 } }),
      Projects.findOneAndUpdate({ _id: projectId, userId }, { $inc: { notesCount: 1 } }),
    ]);

    return res.json(newNote);
  } catch (err) {
    return res.status(500).json({ error: err });
  }
};
