"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorLog = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const errorLogSchema = new mongoose_1.default.Schema({
    message: String,
    stack: String,
    route: String,
    method: String,
    userId: String,
    userAgent: String,
    ip: String,
    country: String,
    headers: mongoose_1.default.Schema.Types.Mixed,
    email: String,
    body: mongoose_1.default.Schema.Types.Mixed,
    requestId: String,
}, { timestamps: true });
exports.ErrorLog = mongoose_1.default.model("ErrorLog", errorLogSchema);
