import { RequestHandler } from "express";
import Project from "../../../modals/ProjectsModal";
import User from "../../../modals/userModal";

export const CreateNewProject: RequestHandler = async (req, res) => {
  const { userId, projectTitle, location, replications, treatments } = req.body;

  try {
    const validUser = await User.findOne({ _id: userId });
    if (!validUser) {
      return res.status(403).json({ error: "User not found" });
    }

    if (!projectTitle || !location || !replications || !treatments) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (treatments < 1 || replications < 1) {
      return res
        .status(400)
        .json({ error: "Replications and treatments must be greater than 1" });
    }

    const existingUser = await Project.findOne({ userId });

    if (existingUser) {
      existingUser.projects.push({
        projectTitle,
        location,
        replications,
        treatments,
      });
      await existingUser.save();
      return res.json({ response: "Project added", existingUser });
    }

    const newProject = new Project({
      userId,
      projectTitle,
      location,
      replications,
      treatments,
    });

    await newProject.save();
    res.json({ response: "Project Created", newProject });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};
