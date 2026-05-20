import { RequestHandler } from "express";
import { PlotNotes } from "../../../modals/Projects/Notes";

export const GetAllPhotos: RequestHandler = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const notesWithPhotos = await PlotNotes.find({
      userId,
    });

    const allPhotoIds: string[] = [];
    notesWithPhotos.forEach((note: any) => {
      note.content.forEach((item: any) => {
        allPhotoIds.push(...item.photoIds);
      });
    });

    return res.status(200).json({ allPhotoIds });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
