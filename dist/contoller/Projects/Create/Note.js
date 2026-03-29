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
exports.CreateNote = void 0;
const Notes_1 = require("../../../modals/Projects/Notes");
const Plots_1 = require("../../../modals/Projects/Plots");
const CreateNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { projectId, plotId, userId, content, photoIds, title } = req.body;
        const validPlot = yield Plots_1.Plots.findOne({
            _id: plotId,
            projectId: projectId,
        });
        if (!validPlot) {
            return res
                .status(400)
                .json({ error: "Invalid plot for the specified project." });
        }
        const newNote = yield Notes_1.PlotNotes.create({
            projectId,
            plotId,
            userId,
            title: title || "",
            content: [{
                    note: Array.isArray(content) ? content : [content],
                    photoIds: Array.isArray(photoIds) ? photoIds : []
                }],
        });
        yield Plots_1.Plots.findByIdAndUpdate(plotId, { $inc: { notesCount: 1 } });
        res.json(newNote);
    }
    catch (err) {
        res.status(500).json({ error: err });
    }
});
exports.CreateNote = CreateNote;
