import { RequestHandler } from "express";
import { Notes } from "../../modals/Projects/Notes";
import User from "../../modals/userModal";
import { Projects } from "../../modals/Projects";
import { Plots } from "../../modals/Projects/Plots";

export const GetPhotoDetails: RequestHandler = async (req, res) => {
  const { userId, photoId } = req.query as { userId: string; photoId: string };

  try {
    const Note = await Notes.findOne({ userId, photoIds: photoId });
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
  } catch (error) {}
};
