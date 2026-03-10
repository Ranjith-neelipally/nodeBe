import { RequestHandler } from "express";
import { PlotNotes } from "../../../modals/Projects/Notes";

export const GetNotes: RequestHandler = async (req, res) => {
  const { userId, projectId, plotId } = req.query as {
    userId?: string;
    projectId?: string;
    plotId?: string;
  };

  try {
    const notes = await PlotNotes.findOne({
      userId: userId,
      projectId: projectId,
      plotId: plotId,
    });
    return res.status(200).json({ data: notes });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};
