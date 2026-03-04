import { RequestHandler } from "express";
import Ideas from "../../../modals/Idea";
import { IdeasInterface } from "src/@types/notes";

export const CreateNewIdea: RequestHandler = async (
  req: IdeasInterface,
  res
) => {
  const { userId, idea, date } = req.body;
  try {
    const newNote = await Ideas.create({
      userId,
      idea,
      date,
    });
    res.status(201).json({ newNote });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};
