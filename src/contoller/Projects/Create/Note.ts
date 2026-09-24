import { RequestHandler } from "express";

import { PlotNotes } from "../../../modals/Projects/Notes";
import { Plots } from "../../../modals/Projects/Plots";
import { Projects } from "../../../modals/Projects";
import { Photos } from "../../../modals/Photos";

const toDateString = (value: Date | string) =>
  new Date(value).toISOString().split("T")[0];

export const CreateNote: RequestHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const { projectId, plotId, content, photoIds, title, date } = req.body;

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

    const requestedPhotoIds = Array.isArray(photoIds) ? photoIds.filter(id => typeof id === "string") : [];
    const ownedPhotoCount = requestedPhotoIds.length
      ? await Photos.countDocuments({ photoId: { $in: requestedPhotoIds }, userId, projectId, plotId, noteId: null })
      : 0;
    if (ownedPhotoCount !== requestedPhotoIds.length) {
      return res.status(400).json({ error: "One or more photos are not available for this note." });
    }

    const newNote = await PlotNotes.create({
      projectId,
      plotId,
      userId,
      date: date || toDateString(new Date()),
      title: title || "",
      content: [{
        note: Array.isArray(content) ? content : [content],
        photoIds: requestedPhotoIds
      }],
    });

    if (requestedPhotoIds.length) {
      await Photos.updateMany(
        { photoId: { $in: requestedPhotoIds }, userId, projectId, plotId, noteId: null },
        { $set: { noteId: newNote._id } },
      );
    }

    await Promise.all([
      Plots.findOneAndUpdate({ _id: plotId, projectId, userId }, { $inc: { notesCount: 1 } }),
      Projects.findOneAndUpdate({ _id: projectId, userId }, { $inc: { notesCount: 1 } }),
    ]);

    return res.json(newNote);
  } catch (err) {
    return res.status(500).json({ error: err });
  }
};
