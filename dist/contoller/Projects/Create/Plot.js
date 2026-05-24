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
exports.CreatePlots = void 0;
const index_1 = require("../../../modals/Projects/index");
const Plots_1 = require("../../../modals/Projects/Plots");
const CreatePlots = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id.toString();
    const { projectId, plots } = req.body;
    let project = null;
    if (!Array.isArray(plots) || plots.length === 0) {
        return res.status(400).json({ error: "No plots provided" });
    }
    try {
        project = yield index_1.Projects.findOne({ _id: projectId, userId });
        if (!project) {
            return res.status(404).json({ error: "Project not found!" });
        }
        const existingPlots = yield Plots_1.Plots.find({ projectId });
        const existingTitles = new Set(existingPlots.map((p) => p.title));
        const existingIndexes = new Set(existingPlots.map((p) => JSON.stringify(p.plotIndex)));
        const shouldRollbackProject = existingPlots.length === 0;
        const rollbackProject = () => __awaiter(void 0, void 0, void 0, function* () {
            if (!(project === null || project === void 0 ? void 0 : project._id) || !shouldRollbackProject)
                return;
            yield index_1.Projects.deleteOne({ _id: project._id });
        });
        const batchTitles = new Set();
        const batchIndexes = new Set();
        for (const plot of plots) {
            if (batchTitles.has(plot.title)) {
                yield rollbackProject();
                return res
                    .status(400)
                    .json({ error: `Duplicate plot title in request: ${plot.title}` });
            }
            if (batchIndexes.has(JSON.stringify(plot.plotIndex))) {
                yield rollbackProject();
                return res.status(400).json({
                    error: `Duplicate plotIndex in request: [${plot.plotIndex}]`,
                });
            }
            batchTitles.add(plot.title);
            batchIndexes.add(JSON.stringify(plot.plotIndex));
            if (existingTitles.has(plot.title)) {
                yield rollbackProject();
                return res.status(400).json({
                    error: `Plot title must be unique within this project: ${plot.title}`,
                });
            }
            if (existingIndexes.has(JSON.stringify(plot.plotIndex))) {
                yield rollbackProject();
                return res.status(400).json({
                    error: `plotIndex must be unique within this project: [${plot.plotIndex}]`,
                });
            }
            if (project.replicationsCount < plot.replication ||
                project.treatmentsCount < plot.treatment) {
                yield rollbackProject();
                return res.status(400).json({
                    error: `Invalid ${project.replicationsCount < plot.replication
                        ? "replication"
                        : "treatment"} number for plot: ${plot.title} ${project.replicationsCount < plot.replication
                        ? `(max ${project.replicationsCount})`
                        : `(max ${project.treatmentsCount})`}`,
                });
            }
        }
        const plotsToInsert = plots.map((plot) => (Object.assign(Object.assign({}, plot), { projectId,
            userId })));
        const createdPlots = yield Plots_1.Plots.insertMany(plotsToInsert);
        return res.status(201).json({ plots: createdPlots });
    }
    catch (error) {
        if ((project === null || project === void 0 ? void 0 : project._id) && projectId) {
            try {
                const existingPlotsCount = yield Plots_1.Plots.countDocuments({ projectId });
                if (existingPlotsCount === 0) {
                    yield index_1.Projects.deleteOne({ _id: project._id });
                }
            }
            catch (_a) { }
        }
        let errorMessage = "Unknown error";
        if (error && typeof error === "object" && "message" in error) {
            errorMessage = error.message;
        }
        else if (typeof error === "string") {
            errorMessage = error;
        }
        else {
            try {
                errorMessage = JSON.stringify(error);
            }
            catch (_b) { }
        }
        return res.status(500).json({ error: errorMessage, data: req.body });
    }
});
exports.CreatePlots = CreatePlots;
