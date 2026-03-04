"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plots = exports.PlotSchema = void 0;
const mongoose_1 = require("mongoose");
exports.PlotSchema = new mongoose_1.Schema({
    projectId: {
        type: mongoose_1.Types.ObjectId,
        ref: "Project",
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    userId: {
        type: mongoose_1.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    color: {
        type: String,
        default: "#3B82F6",
    },
    replication: {
        type: Number,
        required: true,
    },
    treatment: {
        type: Number,
        required: true,
    },
    plotIndex: {
        type: [Number],
        required: true,
    },
    notesCount: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });
exports.Plots = (0, mongoose_1.model)("Plots", exports.PlotSchema);
