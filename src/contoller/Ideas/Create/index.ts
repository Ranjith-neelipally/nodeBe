import { RequestHandler } from "express";
import Ideas from "../../../modals/Idea";
import { IdeasInterface } from "src/@types/notes";

export const CreateNewIdea: RequestHandler = async (
  req: IdeasInterface,
  res
) => {
  const { idea, date } = req.body;
  const userId = req.user.id;
  try {
    const newNote = await Ideas.create({
      userId,
      idea,
      date,
    });
    return res.status(201).json({ newNote });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};
