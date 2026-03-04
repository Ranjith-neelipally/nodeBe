import { RequestHandler } from "express";
import { Projects } from "../../../modals/Projects";
import { Plots } from "../../../modals/Projects/Plots";

export const GetAllPlots: RequestHandler = async (req, res) => {
  const { userId, projectId } = req.query as {
    userId?: string;
    projectId?: string;
  };

  try {
    const plots = await Plots.find({ userId: userId, projectId: projectId });
    res.status(200).json({ data: plots });
  } catch (error) {}
};
