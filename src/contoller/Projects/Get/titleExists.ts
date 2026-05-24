import { RequestHandler } from "express";
import { Projects } from "../../../modals/Projects";

export const CheckProjectTitleExists: RequestHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const title = String(req.query.title || "").trim();

    const existing = await Projects.findOne({ userId, title });
    return res.status(200).json({ exists: !!existing });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

