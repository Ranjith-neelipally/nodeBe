"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlotNotes = exports.PlotNotesSchema = void 0;
const mongoose_1 = require("mongoose");
const PlotNoteItemSchema = new mongoose_1.Schema({
    note: {
        type: [String],
        default: [],
    },
    photoIds: {
        type: [String],
        default: [],
    },
}, { timestamps: true, _id: true });
exports.PlotNotesSchema = new mongoose_1.Schema({
    projectId: {
        type: mongoose_1.Types.ObjectId,
        ref: "Project",
        required: true,
        index: true,
    },
    plotId: {
        type: mongoose_1.Types.ObjectId,
        ref: "Plot",
        required: true,
        index: true,
    },
    title: String,
    content: {
        type: [PlotNoteItemSchema],
        default: [],
    },
    userId: {
        type: mongoose_1.Types.ObjectId,
        ref: "User",
        required: true,
    },
    ProjectTitle: String,
}, { timestamps: true });
exports.PlotNotes = (0, mongoose_1.model)("PlotNotes", exports.PlotNotesSchema);
