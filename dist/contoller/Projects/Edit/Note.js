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
exports.EditNote = void 0;
const Notes_1 = require("../../../modals/Projects/Notes");
const Plots_1 = require("../../../modals/Projects/Plots");
const EditNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId, plotId, noteId, content, photoIds, title } = req.body;
    const userId = req.user.id;
    if (typeof content === "undefined" && typeof photoIds === "undefined" && typeof title === "undefined") {
        return res
            .status(400)
            .json({ error: "At least one of content, photoIds, or title must be provided." });
    }
    try {
        const validPlot = yield Plots_1.Plots.findOne({ _id: plotId, projectId, userId });
        if (!validPlot) {
            return res
                .status(400)
                .json({ error: "Invalid plot for the specified project." });
        }
        const updateObj = {};
        if (typeof title !== "undefined") {
            updateObj.title = title;
        }
        if (Array.isArray(content) && content.length > 0) {
            updateObj["content.0.note"] = content;
        }
        if (Array.isArray(photoIds)) {
            updateObj["content.0.photoIds"] = photoIds;
        }
        const updated = yield Notes_1.PlotNotes.findOneAndUpdate({
            _id: noteId,
            projectId,
            plotId,
            userId,
        }, { $set: updateObj }, { new: true });
        if (!updated) {
            return res.status(404).json({ error: "Note not found!" });
        }
        return res.status(200).json({
            message: "Note updated successfully",
            updated,
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
});
exports.EditNote = EditNote;
