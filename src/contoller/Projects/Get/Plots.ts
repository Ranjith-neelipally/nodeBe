import { RequestHandler } from "express";
import { Plots } from "../../../modals/Projects/Plots";
import { PlotNotes } from "../../../modals/Projects/Notes";

const toDateString = (value: Date | string) =>
  new Date(value).toISOString().split("T")[0];

const noteDate = (note: { date?: string | null; createdAt: Date; createdOfflineAt?: Date | null }) =>
  note.date || toDateString(note.createdOfflineAt || note.createdAt);

export const GetAllPlots: RequestHandler = async (req, res) => {
  const userId = req.user.id;
  const { projectId } = req.query as {
    projectId?: string;
  };

  try {
    const plots = await Plots.find({ userId: userId, projectId: projectId });

    if (!plots.length) {
      return res.status(200).json({ data: [], dates: [] });
    }

    const plotIds = plots.map((plot) => plot._id);
    const plotNotes = await PlotNotes.find(
      { userId, projectId, plotId: { $in: plotIds } },
      { plotId: 1, date: 1, createdAt: 1, createdOfflineAt: 1, _id: 0 },
    );

    const dates = [...new Set(plotNotes.map(noteDate))]
      .sort((a, b) => b.localeCompare(a));

    return res.status(200).json({ data: plots, dates });
  } catch (error) {
    return res.status(500).json({ error });
  }
};
