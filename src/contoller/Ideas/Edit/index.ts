import { RequestHandler } from "express";
import Ideas from "../../../modals/Idea";
import { IdeasInterface } from "src/@types/notes";

export const EditIdea: RequestHandler = async (req: IdeasInterface, res) => {
  const { _id, idea: newIdea, date } = req.body;
  const userId = req.user.id.toString();
  try {
    const idea = await Ideas.findById(_id);

    if (!idea) {
      return res.status(404).json({ error: "Idea not found!" });
    }

    if (!idea.userId || idea.userId.toString() !== userId) {
      return res.status(403).json({ error: "Unauthorized access!" });
    }

    const update: { idea: string; date?: string } = { idea: newIdea };
    if (date) {
      update.date = new Date(date).toISOString().split("T")[0];
    }

    const updatedIdea = await Ideas.findOneAndUpdate(
      { _id, userId },
      { $set: update },
      { new: true },
    );
    return res.status(200).json({ idea: updatedIdea });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};
