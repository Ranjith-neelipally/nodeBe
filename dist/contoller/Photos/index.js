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
exports.GetPhotoDetails = void 0;
const Notes_1 = require("../../modals/Projects/Notes");
const Projects_1 = require("../../modals/Projects");
const Plots_1 = require("../../modals/Projects/Plots");
const GetPhotoDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const { photoId } = req.query;
    try {
        const Note = yield Notes_1.PlotNotes.findOne({ userId, "content.photoIds": photoId });
        if (!Note) {
            return res.status(404).json({ error: "Photo not found!" });
        }
        const plot = yield Plots_1.Plots.findById(Note.plotId);
        const project = yield Projects_1.Projects.findById(Note.projectId);
        const response = {
            _id: Note._id,
            projectId: Note.projectId,
            plotId: Note.plotId,
            content: Note.content,
            userId: Note.userId,
            createdAt: Note.createdAt,
            updatedAt: Note.updatedAt,
            title: plot === null || plot === void 0 ? void 0 : plot.title,
            replication: plot === null || plot === void 0 ? void 0 : plot.replication,
            treatment: plot === null || plot === void 0 ? void 0 : plot.treatment,
            __v: Note.__v,
            ProjectTitle: project === null || project === void 0 ? void 0 : project.title,
        };
        return res.status(200).json(response);
    }
    catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.GetPhotoDetails = GetPhotoDetails;
