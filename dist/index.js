"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
require("./db");
const node_1 = require("./contoller/node");
const routers_1 = require("./routers");
const path_1 = __importDefault(require("path"));
const favicon_1 = require("./MiddleWare/favicon");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use(favicon_1.IgnoreFavIcon);
app.get("/favicon.ico", (req, res) => res.status(204).end());
app.use(express_1.default.static("src/public"));
app.use(express_1.default.static("src/public/reset-password.html"));
app.use("/auth", routers_1.AuthRouter);
app.use("/projects", routers_1.ProjectsRouter);
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.get("/", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "dist", "index.html"));
});
app.patch("/createNewProject", node_1.createProject);
app.patch("/AddNotes", node_1.AddNotes);
app.get("/getProject/:projectId", node_1.FindProject);
app.get("/getAllProjects", node_1.GetAllProjects);
app.get("/getNotes/:projectid/:noteId");
app.patch("/EditProjectData/:projectid/:field", node_1.EditProjectDate);
app.delete("/deteteProject/:projectId", node_1.DeleteProject);
app.delete("/deleteNote/:projectId/:noteId", node_1.DeleteNote);
app.patch("/editNote/:projectId/:noteId", node_1.EditNote);
app.listen(1430, () => {
    console.log("listening to port and");
});
