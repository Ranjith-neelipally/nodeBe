"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationReceipt = void 0;
const mongoose_1 = require("mongoose");
const OperationReceiptSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    opId: {
        type: String,
        required: true,
        trim: true,
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
    status: {
        type: String,
        enum: ["accepted", "duplicate", "failed"],
        default: "accepted",
    },
    responseCode: {
        type: String,
        required: true,
        default: "ACKNOWLEDGED",
    },
}, { timestamps: true });
OperationReceiptSchema.index({ userId: 1, opId: 1 }, { unique: true });
exports.OperationReceipt = (0, mongoose_1.model)("OperationReceipt", OperationReceiptSchema);
