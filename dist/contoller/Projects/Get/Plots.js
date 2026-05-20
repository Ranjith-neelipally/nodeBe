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
exports.GetAllPlots = void 0;
const Plots_1 = require("../../../modals/Projects/Plots");
const Notes_1 = require("../../../modals/Projects/Notes");
const toDateString = (value) => new Date(value).toISOString().split("T")[0];
const GetAllPlots = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const { projectId } = req.query;
    try {
        const plots = yield Plots_1.Plots.find({ userId: userId, projectId: projectId });
        if (!plots.length) {
            return res.status(200).json({ data: [], dates: [] });
        }
        const plotIds = plots.map((plot) => plot._id);
        const plotNotes = yield Notes_1.PlotNotes.find({ plotId: { $in: plotIds } }, { plotId: 1, createdAt: 1, _id: 0 });
        const dates = [...new Set(plotNotes.map(({ createdAt }) => toDateString(createdAt)))]
            .sort((a, b) => b.localeCompare(a));
        return res.status(200).json({ data: plots, dates });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
exports.GetAllPlots = GetAllPlots;
