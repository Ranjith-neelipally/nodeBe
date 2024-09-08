"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const TreatmentsSchema = new mongoose_1.Schema({
    projectId: {
        type: String,
        required: true,
        trim: true,
    },
    treatments: {
        type: Number,
        required: true,
        trim: true,
    },
    replications: {
        type: Number,
        required: true,
        trim: true,
    },
});
exports.default = (0, mongoose_1.model)("Treatments", TreatmentsSchema);
