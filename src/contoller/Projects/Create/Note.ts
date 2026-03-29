import { RequestHandler } from "express";

import { PlotNotes } from "../../../modals/Projects/Notes";
import { Plots } from "../../../modals/Projects/Plots";

export const CreateNote: RequestHandler = async (req, res) => {
  try {
    let { projectId, plotId, userId, content, photoIds, title } = req.body;

    const validPlot = await Plots.findOne({
      _id: plotId,
      projectId: projectId,
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

    // Update the plot's notesCount
    await Plots.findByIdAndUpdate(plotId, { $inc: { notesCount: 1 } });

    res.json(newNote);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
