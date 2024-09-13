"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Projects_1 = require("../../contoller/Projects");
const ProjectsRouter = (0, express_1.Router)();
ProjectsRouter.post("/create-new", Projects_1.CreateNewProject);
exports.default = ProjectsRouter;
