import { RequestHandler } from "express";
import { PlotNotes } from "../../../modals/Projects/Notes";
import { Plots } from "../../../modals/Projects/Plots";
import { Photos } from "../../../modals/Photos";

export const EditNote: RequestHandler = async (req, res) => {
  const { projectId, plotId, noteId, content, photoIds, title } = req.body;
  const userId = req.user.id;

  if (typeof content === "undefined" && typeof photoIds === "undefined" && typeof title === "undefined") {
    return res
      .status(400)
      .json({ error: "At least one of content, photoIds, or title must be provided." });
  }

  try {
    const validPlot = await Plots.findOne({ _id: plotId, projectId, userId });
    if (!validPlot) {
      return res
        .status(400)
        .json({ error: "Invalid plot for the specified project." });
    }

    if (Array.isArray(photoIds)) {
      const requestedPhotoIds = photoIds.filter(id => typeof id === "string");
      const ownedPhotoCount = requestedPhotoIds.length
        ? await Photos.countDocuments({
            photoId: { $in: requestedPhotoIds }, userId, projectId, plotId,
            $or: [{ noteId }, { noteId: null }],
          })
        : 0;
      if (ownedPhotoCount !== requestedPhotoIds.length) {
        return res.status(400).json({ error: "One or more photos are not available for this note." });
      }
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
        userId,
      },
      { $set: updateObj },
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({ error: "Note not found!" });
    }

    if (Array.isArray(photoIds)) {
      await Promise.all([
        Photos.updateMany(
          { photoId: { $in: photoIds }, userId, projectId, plotId, noteId: null },
          { $set: { noteId } },
        ),
        Photos.updateMany(
          { photoId: { $nin: photoIds }, userId, projectId, plotId, noteId },
          { $set: { noteId: null } },
        ),
      ]);
    }

    return res.status(200).json({
      message: "Note updated successfully",
      updated,
    });
  } catch (error) {
    return res.status(500).json({ error });
  }
};
