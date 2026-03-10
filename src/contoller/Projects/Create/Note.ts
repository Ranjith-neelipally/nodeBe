import { RequestHandler } from "express";

import { PlotNotes } from "../../../modals/Projects/Notes";
import { Plots } from "../../../modals/Projects/Plots";

export const CreateNote: RequestHandler = async (req, res) => {
  try {
    let { projectId, plotId, userId, content, photoIds } = req.body;

    const validPlot = await Plots.findOne({
      _id: plotId,
      projectId: projectId,
    });

    if (!validPlot) {
      return res
        .status(400)
        .json({ error: "Invalid plot for the specified project." });
    }

    let formattedContent: any[] = [];
    if (Array.isArray(content)) {
      formattedContent = content.map((noteText, idx) => ({
        note: noteText,
        photoIds: idx === 0 && Array.isArray(photoIds) ? photoIds : []
      }));
    } else if (typeof content === "string") {
      formattedContent = [{ note: content, photoIds: Array.isArray(photoIds) ? photoIds : [] }];
    }

    let doc = await PlotNotes.findOne({ projectId, plotId, userId });

    if (doc) {
      doc.content.push(...formattedContent);
      await doc.save();
    } else {
      doc = await PlotNotes.create({
        projectId,
        plotId,
        userId,
        content: formattedContent,
      });
    }

    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
