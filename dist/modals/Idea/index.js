"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const metadata_1 = require("../../sync/metadata");
const IdeasSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        require: true,
    },
    idea: {
        type: String,
        require: true,
    },
    date: {
        type: String,
        require: true,
    },
    isConflict: {
        type: Boolean,
        default: false,
        index: true,
    },
    conflictGroupId: {
        type: String,
        default: null,
        trim: true,
        index: true,
    },
    conflictReason: {
        type: String,
        default: null,
        trim: true,
    },
}, { timestamps: true });
(0, metadata_1.attachSyncMetadata)(IdeasSchema);
exports.default = (0, mongoose_1.model)("Ideas", IdeasSchema);
