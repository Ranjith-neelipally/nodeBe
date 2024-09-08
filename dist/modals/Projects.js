"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ProjectsCollectionSChems = new mongoose_1.Schema({
    projectTitle: {
        type: String,
    },
    location: {
        type: String,
    },
    replications: {
        type: Number,
    },
    treatments: {
        type: Number,
    },
});
const ProjectSchema = new mongoose_1.Schema({
    userMail: {
        type: String,
        required: false,
        trim: true,
    },
    projects: {
        type: [ProjectsCollectionSChems],
        required: true,
        trim: true,
    },
});
exports.default = (0, mongoose_1.model)("Project", ProjectSchema);
