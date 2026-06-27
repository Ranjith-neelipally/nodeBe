import { RequestHandler } from "express";
import { IdeasInterface } from "src/@types/notes";
import Ideas from "../../../modals/Idea";

export const DeleteIdea: RequestHandler = async (req: IdeasInterface, res) => {
  const { _id } = req.body;
  const userId = req.user.id;
  try {
    const idea = await Ideas.findOneAndDelete({ _id, userId });

    if (!idea) {
      return res.status(404).json({ error: "Idea not found!" });
    }

    return res.status(200).json({ message: "Idea deleted successfully!" });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};
