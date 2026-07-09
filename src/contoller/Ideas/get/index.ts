import { RequestHandler } from "express";
import Ideas from "../../../modals/Idea";

const ideasQueryLimit = 15;

export const GetIdea: RequestHandler = async (req, res) => {
  const { date, limit, page } = {
    ...req.query,
    ...req.params,
  } as {
    date?: string;
    limit?: string | number;
    page?: string | number;
  };
  const userId = req.user.id;

  try {
    let query: any = { userId };
    if (date) {
      query.date = { $regex: `^${date}` };
    }
    let ideasQuery = Ideas.find(query);
    let lim = ideasQueryLimit;
    if (limit && !isNaN(Number(limit))) {
      lim = Math.max(1, Math.min(100, Number(limit)));
    }
    let pg = 1;
    if (page && !isNaN(Number(page))) {
      pg = Math.max(1, Number(page));
    }
    ideasQuery = ideasQuery.skip((pg - 1) * lim).limit(lim);
    const [userIdeas, dates] = await Promise.all([
      ideasQuery,
      Ideas.distinct("date", { userId }),
    ]);
    return res.status(200).json({
      userIdeas,
      dates: [...new Set(dates.filter(Boolean).map((value) => String(value).split("T")[0]))]
        .sort((a, b) => b.localeCompare(a)),
      page: pg,
      limit: lim,
    });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};
