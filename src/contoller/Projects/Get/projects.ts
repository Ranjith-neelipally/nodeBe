import { RequestHandler } from "express";
import { Projects } from "../../../modals/Projects";
import { Plots } from "../../../modals/Projects/Plots";

export const GetAllProjects: RequestHandler = async (req, res) => {
  const { userId } = req.query as {
    userId?: string;
  };
  try {
    const projects = await Projects.find({ userId: userId });

    if (!projects.length) {
      return res.status(200).json({ projects: [] });
    }

    const projectIds = projects.map((project) => project._id);

    const plotColors = await Plots.find(
      { projectId: { $in: projectIds } },
      { color: 1, projectId: 1, _id: 0 }
    );

    const plotColorMap: { [key: string]: string[] } = {};

    plotColors.forEach(({ projectId, color }) => {
      const key = projectId.toString();
      if (!plotColorMap[key]) plotColorMap[key] = [];
      plotColorMap[key].push(color);
    });

    const projectsWithColors = projects.map((project) => {
      const id = project._id.toString();
      const colors = plotColorMap[id] || [];

      const uniqueColors = [...new Set(colors)];
      return {
        ...project.toObject(),
        plotColors: uniqueColors,
      };
    });

    res.status(200).json({ projects: projectsWithColors });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};
