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
exports.GetAllProjects = void 0;
const Projects_1 = require("../../../modals/Projects");
const Plots_1 = require("../../../modals/Projects/Plots");
const Notes_1 = require("../../../modals/Projects/Notes");
const toDateString = (value) => new Date(value).toISOString().split("T")[0];
const GetAllProjects = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.query;
    try {
        const projects = yield Projects_1.Projects.find({ userId: userId });
        if (!projects.length) {
            return res.status(200).json({ data: [], dates: [] });
        }
        const projectIds = projects.map((project) => project._id);
        const [plotColors, projectNotes] = yield Promise.all([
            Plots_1.Plots.find({ projectId: { $in: projectIds } }, { color: 1, projectId: 1, _id: 0 }),
            Notes_1.PlotNotes.find({ projectId: { $in: projectIds } }, { projectId: 1, createdAt: 1, _id: 0 }),
        ]);
        const plotColorMap = {};
        const availableDatesMap = {};
        plotColors.forEach(({ projectId, color }) => {
            const key = projectId.toString();
            if (!plotColorMap[key])
                plotColorMap[key] = [];
            plotColorMap[key].push(color);
        });
        projectNotes.forEach(({ projectId, createdAt }) => {
            const key = projectId.toString();
            if (!availableDatesMap[key]) {
                availableDatesMap[key] = new Set();
            }
            const dateValue = toDateString(createdAt);
            availableDatesMap[key].add(dateValue);
        });
        const projectsWithColors = projects.map((project) => {
            const id = project._id.toString();
            const colors = plotColorMap[id] || [];
            const uniqueColors = [...new Set(colors)];
            return Object.assign(Object.assign({}, project.toObject()), { plotColors: uniqueColors });
        });
        const dates = [...new Set(projectNotes.map(({ createdAt }) => toDateString(createdAt)))]
            .sort((a, b) => b.localeCompare(a));
        res.status(200).json({ data: projectsWithColors, dates });
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
});
exports.GetAllProjects = GetAllProjects;
