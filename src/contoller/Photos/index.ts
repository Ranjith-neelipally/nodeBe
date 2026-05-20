import { RequestHandler } from "express";
import { PlotNotes } from "../../modals/Projects/Notes";
import User from "../../modals/userModal";
import { Projects } from "../../modals/Projects";
import { Plots } from "../../modals/Projects/Plots";

export const GetPhotoDetails: RequestHandler = async (req, res) => {
  const userId = req.user.id;
  const { photoId } = req.query as { photoId: string };

  try {
    const Note = await PlotNotes.findOne({ userId, "content.photoIds": photoId });
    if (!Note) {
      return res.status(404).json({ error: "Photo not found!" });
    }
    const plot = await Plots.findById(Note.plotId);
    const project = await Projects.findById(Note.projectId);

    const response = {
      _id: Note._id,
      projectId: Note.projectId,
      plotId: Note.plotId,
      content: Note.content,
      userId: Note.userId,
      createdAt: Note.createdAt,
      updatedAt: Note.updatedAt,
      title: plot?.title,
      replication: plot?.replication,
      treatment: plot?.treatment,
      __v: Note.__v,
      ProjectTitle: project?.title,
    };
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
