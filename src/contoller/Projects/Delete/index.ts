import { RequestHandler } from "express";
import { Projects } from "../../../modals/Projects";
import { Plots } from "../../../modals/Projects/Plots";
import { PlotNotes } from "../../../modals/Projects/Notes";
import Ideas from "../../../modals/Idea";
import Treatments from "../../../modals/Treatments";
import User from "../../../modals/userModal";
import { SyncChange } from "../../../modals/Sync/SyncChange";
import { SyncConflict } from "../../../modals/Sync/SyncConflict";
import { OperationReceipt } from "../../../modals/Sync/OperationReceipt";
import { ObservationSessions, ObservationTypes } from "../../../modals/Projects/Observations";

export const DeleteProject: RequestHandler = async (
  req,
  res,
) => {
  try {
    const { _id } = req.body;
    const userId = req.user.id;

    const project = await Projects.findOne({
      _id,
      userId,
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const plots = await Plots.find(
      { projectId: project._id, userId },
      { _id: 1 },
    );
    const notes = await PlotNotes.find(
      { projectId: project._id, userId },
      { _id: 1 },
    );
    const relatedEntityIds = [
      project._id.toString(),
      ...plots.map((plot) => plot._id.toString()),
      ...notes.map((note) => note._id.toString()),
    ];

    await Promise.all([
      PlotNotes.deleteMany({ projectId: project._id, userId }),
      Plots.deleteMany({ projectId: project._id, userId }),
      Ideas.deleteMany({ projectId: project._id, userId }),
      ObservationSessions.deleteMany({ projectId: project._id }),
      ObservationTypes.deleteMany({ projectId: project._id }),
      Treatments.deleteMany({ projectId: project._id.toString() }),
      SyncChange.deleteMany({ userId, entityId: { $in: relatedEntityIds } }),
      SyncConflict.deleteMany({ userId, entityId: { $in: relatedEntityIds } }),
      OperationReceipt.deleteMany({ userId, entityId: { $in: relatedEntityIds } }),
      User.updateOne({ _id: userId }, { $pull: { ProjectIds: project._id } }),
    ]);

    await Projects.deleteOne({ _id: project._id, userId });

    return res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const DeleteNote: RequestHandler = async (
  req,
  res,
) => {
  try {
    const { _id, projectId, plotId } = req.body;
    const userId = req.user.id;
    const note = await PlotNotes.findOneAndDelete({
      _id,
      userId,
      projectId,
      plotId,
    });

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    await Promise.all([
      Plots.findOneAndUpdate(
        { _id: plotId, projectId, userId },
        [{ $set: { notesCount: { $max: [0, { $subtract: ["$notesCount", 1] }] } } }],
      ),
      Projects.findOneAndUpdate(
        { _id: projectId, userId },
        [{ $set: { notesCount: { $max: [0, { $subtract: ["$notesCount", 1] }] } } }],
      ),
    ]);

    return res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
