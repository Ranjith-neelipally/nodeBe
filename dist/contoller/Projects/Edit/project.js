"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditProject = void 0;
const Projects_1 = require("../../../modals/Projects");
const EditProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, title, replications, treatments, location, _id, } = req.body;
        const Project = yield Projects_1.Projects.findOne({
            _id,
            userId,
        });
        if (!Project) {
            return res.status(404).json({ error: "Project not found" });
        }
        const existingTitle = yield Projects_1.Projects.findOne({
            title,
            userId,
            _id: { $ne: Project._id },
        });
        if (existingTitle) {
            return res.status(400).json({
                error: "Project title already exists",
            });
        }
        const newProject = yield Projects_1.Projects.findByIdAndUpdate(Project._id, {
            $set: {
                title,
                replicationsCount: replications,
                treatmentsCount: treatments,
                location,
            },
        }, { new: true });
        res.status(201).json({ newProject });
    }
    catch (error) {
        console.error("Error creating project:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.EditProject = EditProject;
