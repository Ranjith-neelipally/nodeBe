import { RequestHandler } from "express";
import { Projects } from "../../../modals/Projects";
import { Plots } from "../../../modals/Projects/Plots";
import { PlotNotes } from "../../../modals/Projects/Notes";

const toDateString = (value: Date | string) =>
  new Date(value).toISOString().split("T")[0];

export const GetAllProjects: RequestHandler = async (req, res) => {
  const userId = req.user.id;
  try {
    const projects = await Projects.find({ userId: userId });

    if (!projects.length) {
      return res.status(200).json({ data: [], dates: [] });
    }

    const projectIds = projects.map((project) => project._id);

    const [plotColors, projectNotes] = await Promise.all([
      Plots.find(
        { projectId: { $in: projectIds } },
        { color: 1, projectId: 1, _id: 0 }
      ),
      PlotNotes.find(
        { projectId: { $in: projectIds } },
        { projectId: 1, createdAt: 1, _id: 0 }
      ),
    ]);

    const plotColorMap: { [key: string]: string[] } = {};
    const availableDatesMap: { [key: string]: Set<string> } = {};

    plotColors.forEach(({ projectId, color }) => {
      const key = projectId.toString();
      if (!plotColorMap[key]) plotColorMap[key] = [];
      plotColorMap[key].push(color);
    });

    projectNotes.forEach(({ projectId, createdAt }) => {
      const key = projectId.toString();
      if (!availableDatesMap[key]) {
        availableDatesMap[key] = new Set<string>();
      }

      const dateValue = toDateString(createdAt);
      availableDatesMap[key].add(dateValue);
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

    const dates = [...new Set(projectNotes.map(({ createdAt }) => toDateString(createdAt)))]
      .sort((a, b) => b.localeCompare(a));

    return res.status(200).json({ data: projectsWithColors, dates });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};
