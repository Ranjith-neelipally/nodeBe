import mongoose from "mongoose";

const errorLogSchema = new mongoose.Schema({
    message: String,
    stack: String,
    route: String,
    method: String,
    userId: String,
    userAgent: String,
    ip: String,
    country: String,
    headers: mongoose.Schema.Types.Mixed,
    email: String,
    body: mongoose.Schema.Types.Mixed,
    requestId: String,
}, { timestamps: true });

export const ErrorLog = mongoose.model("ErrorLog", errorLogSchema);
