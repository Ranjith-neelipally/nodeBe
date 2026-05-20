"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteNote = exports.DeletePlot = exports.DeleteProject = void 0;
const Projects_1 = require("../../../modals/Projects");
const Plots_1 = require("../../../modals/Projects/Plots");
const Notes_1 = require("../../../modals/Projects/Notes");
const DeleteProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id } = req.body;
        const userId = req.user.id;
        const project = yield Projects_1.Projects.findOne({
            _id,
            userId,
        });
        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }
        yield Projects_1.Projects.deleteOne({ _id: project._id });
        yield Plots_1.Plots.deleteMany({ projectId: project._id });
        yield Notes_1.PlotNotes.deleteMany({ projectId: project._id });
        return res.status(200).json({ message: "Project deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting project:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.DeleteProject = DeleteProject;
const DeletePlot = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id, projectId } = req.body;
        const userId = req.user.id;
        const plot = yield Plots_1.Plots.findOne({
            _id,
            userId,
            projectId,
        });
        if (!plot) {
            return res.status(404).json({ error: "Plot not found" });
        }
        yield Plots_1.Plots.deleteOne({ _id: plot._id });
        yield Notes_1.PlotNotes.deleteMany({ plotId: plot._id });
        return res.status(200).json({ message: "Plot deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting plot:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.DeletePlot = DeletePlot;
const DeleteNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id, projectId, plotId } = req.body;
        const userId = req.user.id;
        const note = yield Notes_1.PlotNotes.findOne({
            _id,
            userId,
            projectId,
            plotId,
        });
        if (!note) {
            return res.status(404).json({ error: "Note not found" });
        }
        yield Notes_1.PlotNotes.deleteOne({ _id: note._id });
        yield Plots_1.Plots.findByIdAndUpdate(plotId, { $inc: { notesCount: -1 } });
        return res.status(200).json({ message: "Note deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting note:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.DeleteNote = DeleteNote;
