import { RequestHandler } from "express";
import { Photos } from "../../../modals/Photos";

export const GetAllPhotos: RequestHandler = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const photos = await Photos.find({ userId }).sort({ capturedAt: -1 }).lean();
    return res.status(200).json({ photos });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
