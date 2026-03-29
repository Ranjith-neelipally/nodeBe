import { RequestHandler } from "express";
import { PlotNotes } from "../../../modals/Projects/Notes";

const defaultQueryLimit = 15;
const toDateString = (value: Date | string) =>
  new Date(value).toISOString().split("T")[0];

export const GetNotes: RequestHandler = async (req, res) => {
  const { userId, projectId, plotId, date, limit, page } = req.query as {
    userId?: string;
    projectId?: string;
    plotId?: string;
    date?: string;
    limit?: string | number;
    page?: string | number;
  };

  try {
    let lim = defaultQueryLimit;
    if (limit && !isNaN(Number(limit))) {
      lim = Math.max(1, Math.min(100, Number(limit)));
    }

    let pg = 1;
    if (page && !isNaN(Number(page))) {
      pg = Math.max(1, Number(page));
    }

    const query: Record<string, unknown> = {
      userId,
      projectId,
    };

    if (date) {
      const startDate = new Date(`${date}T00:00:00.000Z`);
      const endDate = new Date(`${date}T23:59:59.999Z`);

      query.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };
    } else if (plotId) {
      query.plotId = plotId;
    }

    const [notes, total] = await Promise.all([
      PlotNotes.find(query)
        .skip((pg - 1) * lim)
        .limit(lim),
      PlotNotes.countDocuments(query),
    ]);

    const formattedNotes = notes.map((note) => ({
      ...note.toObject(),
      date: toDateString(note.createdAt),
    }));

    return res.status(200).json({
      data: formattedNotes,
      page: pg,
      limit: lim,
      total,
    });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};
