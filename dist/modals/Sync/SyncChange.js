"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncChange = void 0;
const mongoose_1 = require("mongoose");
const SyncChangeSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    cursor: {
        type: Number,
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
    action: {
        type: String,
        enum: ["create", "update", "delete"],
        required: true,
    },
    serverVersion: {
        type: Number,
        required: true,
        min: 1,
    },
    payload: {
        type: mongoose_1.Schema.Types.Mixed,
        default: null,
    },
}, { timestamps: true });
SyncChangeSchema.index({ userId: 1, cursor: 1 });
exports.SyncChange = (0, mongoose_1.model)("SyncChange", SyncChangeSchema);
