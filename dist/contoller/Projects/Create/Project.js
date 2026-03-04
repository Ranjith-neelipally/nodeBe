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
exports.CreateNewProject = void 0;
const Projects_1 = require("../../../modals/Projects");
const CreateNewProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, title, plotsCount, replications, treatments, location } = req.body;
        const exsitingTitle = yield Projects_1.Projects.findOne({
            title: title,
            userId: userId,
        });
        if (exsitingTitle) {
            return res.status(409).json({ error: "Project title already exists" });
        }
        const data = yield Projects_1.Projects.create({
            userId,
            title,
            plotsCount,
            replicationsCount: replications,
            treatmentsCount: treatments,
            location,
        });
        res.status(201).json({ data });
    }
    catch (error) {
        console.error("Error creating project:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.CreateNewProject = CreateNewProject;
