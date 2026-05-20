"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncConflict = void 0;
const mongoose_1 = require("mongoose");
const SyncConflictSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    entityType: {
        type: String,
        enum: ["project", "plot", "note", "idea"],
        required: true,
    },
    entityId: {
        type: String,
        required: true,
        trim: true,
    },
    opId: {
        type: String,
        required: true,
        trim: true,
    },
    conflictGroupId: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    reason: {
        type: String,
        required: true,
        trim: true,
    },
    localPayload: {
        type: mongoose_1.Schema.Types.Mixed,
        default: null,
    },
    serverSnapshot: {
        type: mongoose_1.Schema.Types.Mixed,
        default: null,
    },
    resolved: {
        type: Boolean,
        default: false,
        index: true,
    },
}, { timestamps: true });
exports.SyncConflict = (0, mongoose_1.model)("SyncConflict", SyncConflictSchema);
