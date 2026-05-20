import { RequestHandler } from "express";
import { Projects } from "../../../modals/Projects";
import { Project } from "src/@types/Projects";

export const CreateNewProject: RequestHandler = async (req: Project, res) => {
  try {
    const userId = req.user.id;
    const { title, plotsCount, replications, treatments, location } = req.body;
    const exsitingTitle = await Projects.findOne({
      title: title,
      userId: userId,
    });
    if (exsitingTitle) {
      return res.status(409).json({ error: "Project title already exists" });
    }

    const data = await Projects.create({
      userId,
      title,
      plotsCount,
      replicationsCount: replications,
      treatmentsCount: treatments,
      location,
    });
    return res.status(201).json({ data });
  } catch (error) {
    console.error("Error creating project:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
