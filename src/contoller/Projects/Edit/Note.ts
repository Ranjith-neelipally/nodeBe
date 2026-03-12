import { RequestHandler } from "express";
import { PlotNotes } from "../../../modals/Projects/Notes";
import { Plots } from "../../../modals/Projects/Plots";

export const EditNote: RequestHandler = async (req, res) => {
  const { projectId, plotId, noteId, content, photoIds } = req.body;

  if (typeof content === "undefined" && typeof photoIds === "undefined") {
    return res
      .status(400)
      .json({ error: "At least one of content or photoIds must be provided." });
  }

  try {
    const validPlot = await Plots.findOne({ _id: plotId, projectId });
    if (!validPlot) {
      return res
        .status(400)
        .json({ error: "Invalid plot for the specified project." });
    }

    const updateObj: any = {};
    if (Array.isArray(content) && content.length > 0) {
      updateObj["content.$.note"] = content;
    }
    if (Array.isArray(photoIds)) {
      updateObj["content.$.photoIds"] = photoIds;
    }

    const updated = await PlotNotes.findOneAndUpdate(
      {
        projectId,
        plotId,
        "content._id": noteId,
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
