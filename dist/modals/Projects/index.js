"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Projects = exports.ProjectSchema = void 0;
const mongoose_1 = require("mongoose");
const metadata_1 = require("../../sync/metadata");
exports.ProjectSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    location: {
        type: String,
        trim: true,
        default: "Not Specified",
    },
    replicationsCount: {
        type: Number,
        required: true,
    },
    treatmentsCount: {
        type: Number,
        required: true,
    },
    userId: {
        ref: "User",
        type: mongoose_1.Types.ObjectId,
        required: true,
    },
    plotsCount: {
        type: Number,
        default: 0,
    },
    notesCount: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });
(0, metadata_1.attachSyncMetadata)(exports.ProjectSchema);
exports.Projects = (0, mongoose_1.model)("Projects", exports.ProjectSchema);
