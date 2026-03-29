import { RequestHandler } from "express";
import { PlotNotes } from "../../../modals/Projects/Notes";
import { Plots } from "../../../modals/Projects/Plots";

export const EditNote: RequestHandler = async (req, res) => {
  const { projectId, plotId, noteId, content, photoIds, title } = req.body;

  if (typeof content === "undefined" && typeof photoIds === "undefined" && typeof title === "undefined") {
    return res
      .status(400)
      .json({ error: "At least one of content, photoIds, or title must be provided." });
  }

  try {
    const validPlot = await Plots.findOne({ _id: plotId, projectId });
    if (!validPlot) {
      return res
        .status(400)
        .json({ error: "Invalid plot for the specified project." });
    }

    const updateObj: any = {};
    if (typeof title !== "undefined") {
      updateObj.title = title;
    }
    if (Array.isArray(content) && content.length > 0) {
      updateObj["content.0.note"] = content;
    }
    if (Array.isArray(photoIds)) {
      updateObj["content.0.photoIds"] = photoIds;
    }

    const updated = await PlotNotes.findOneAndUpdate(
      {
        _id: noteId,
        projectId,
        plotId,
      },
      { $set: updateObj },
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({ error: "Note not found!" });
    }

    res.status(200).json({
      message: "Note updated successfully",
      updated,
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};
