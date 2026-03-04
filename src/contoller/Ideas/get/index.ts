import { RequestHandler } from "express";
import Ideas from "../../../modals/Idea";

const ideasQueryLimit = 15;

export const GetIdea: RequestHandler = async (req, res) => {
  const { date, userId, limit, page } = {
    ...req.query,
    ...req.params,
  } as {
    userId?: string;
    date?: string;
    limit?: string | number;
    page?: string | number;
  };
  if (!userId) {
    return res.status(400).json({ error: "User ID is required!" });
  }

  try {
    let query: any = { userId };
    if (date) {
      query.date = date;
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
    const userIdeas = await ideasQuery;
    return res.status(200).json({ userIdeas, page: pg, limit: lim });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};
