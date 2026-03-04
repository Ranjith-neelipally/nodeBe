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
exports.EditPlot = void 0;
const index_1 = require("../../../modals/Projects/index");
const Plots_1 = require("../../../modals/Projects/Plots");
const EditPlot = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, projectId, title, color, notesCount, replication, treatment, _id, } = req.body;
    try {
        const project = yield index_1.Projects.findById(projectId);
        const validPlot = yield Plots_1.Plots.findOne({ projectId, _id, userId });
        if (!project || project.userId.toString() !== userId) {
            return res.status(404).json({ error: "Project not found!" });
        }
        if (!validPlot) {
            return res.status(404).json({ error: "Plot not found!" });
        }
        const existingTitle = yield index_1.Projects.findOne({
            title,
            userId,
            _id: { $ne: validPlot._id },
        });
        if (existingTitle) {
            return res.status(400).json({ error: "Plot title must be unique!" });
        }
        if (project.replicationsCount < replication ||
            project.treatmentsCount < treatment) {
            return res.status(400).json({
                error: `Invalid ${project.replicationsCount < replication ? "replication" : "treatment"} number!`,
            });
        }
        const plot = yield Plots_1.Plots.findByIdAndUpdate(validPlot._id, {
            $set: {
                title,
                color,
                replication,
                treatment,
                notesCount,
                plotIndex: [replication, treatment],
            },
        }, { new: true });
        res.status(201).json({ plot });
    }
    catch (error) {
        res.status(500).json(req.body);
    }
});
exports.EditPlot = EditPlot;
