import { RequestHandler } from "express";
import Ideas from "../../../modals/Idea";
import { IdeasInterface } from "src/@types/notes";

export const CreateNewIdea: RequestHandler = async (
  req: IdeasInterface,
  res
) => {
  const { idea, date, reminderEnabled, reminderTime, projectId, plotId, completed, notificationIds } = req.body;
  const userId = req.user.id;
  try {
    const newNote = await Ideas.create({
      userId,
      idea,
      date: new Date(date).toISOString().split("T")[0],
      reminderEnabled: reminderEnabled ?? false,
      reminderTime: reminderTime || null,
      projectId: projectId || null,
      plotId: projectId && plotId ? plotId : null,
      completed: completed ?? false,
      notificationIds: notificationIds || [],
    });
    return res.status(201).json({ newNote });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};
