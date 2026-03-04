import { RequestHandler } from "express";
import { Projects } from "../../../modals/Projects";
import { Plots } from "../../../modals/Projects/Plots";
import { PlotNotes } from "../../../modals/Projects/Notes";

interface DeleteProjectBody {
  body: {
    _id: string;
    userId: string;
    projectId?: string;
    plotId?: string;
  };
}

export const DeleteProject: RequestHandler = async (
  req: DeleteProjectBody,
  res,
) => {
  try {
    const { _id, userId } = req.body;

    const project = await Projects.findOne({
      _id,
      userId,
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    await Projects.deleteOne({ _id: project._id });

    await Plots.deleteMany({ projectId: project._id });
    await PlotNotes.deleteMany({ projectId: project._id });

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const DeletePlot: RequestHandler = async (
  req: DeleteProjectBody,
  res,
) => {
  try {
    const { _id, userId, projectId } = req.body;
    const plot = await Plots.findOne({
      _id,
      userId,
      projectId,
    });

    if (!plot) {
      return res.status(404).json({ error: "Plot not found" });
    }

    await Plots.deleteOne({ _id: plot._id });
    await PlotNotes.deleteMany({ plotId: plot._id });

    res.status(200).json({ message: "Plot deleted successfully" });
  } catch (error) {
    console.error("Error deleting plot:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const DeleteNote: RequestHandler = async (
  req: DeleteProjectBody,
  res,
) => {
  try {
    const { _id, userId, projectId, plotId } = req.body;
    const note = await PlotNotes.findOne({
      _id,
      userId,
      projectId,
      plotId,
    });

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    await PlotNotes.deleteOne({ _id: note._id });

    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
