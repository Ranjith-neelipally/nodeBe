import { RequestHandler } from "express";
import { IdeasInterface } from "src/@types/notes";
import Ideas from "../../../modals/Idea";

export const DeleteIdea: RequestHandler = async (req: IdeasInterface, res) => {
  const { _id, userId } = req.body;
  try {
    const idea = await Ideas.find({
      _id: _id,
      userId: userId,
    });

    if (idea.length === 0) {
      return res.status(404).json({ error: "Idea not found!" });
    }

    await Ideas.deleteOne({ _id: _id, userId: userId });
    res.status(200).json({ message: "Idea deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};
