import { RequestHandler } from "express";
import { Notes } from "../../../modals/Projects/Notes";

export const GetAllPhotos: RequestHandler = async (req, res, next) => {
  const { userId } = req.query as { userId: string };

  try {
    const notesWithPhotos = await Notes.find({
      userId,
    });

    const allPhotoIds: string[] = [];
    notesWithPhotos.forEach((note) => {
      allPhotoIds.push(...note.photoIds);
    });

    return res.status(200).json({ allPhotoIds });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
