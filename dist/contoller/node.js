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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditNote = exports.DeleteNote = exports.DeleteProject = exports.EditProjectDate = exports.GetAllProjects = exports.FindProject = exports.AddNotes = exports.createProject = void 0;
const Projects_1 = __importDefault(require("../modals/Projects"));
const Treatments_1 = __importDefault(require("../modals/Treatments"));
const createProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userMail } = req.body;
        const existingProject = yield Projects_1.default.findOne({ userMail });
        if (!existingProject) {
            const newProject = yield Projects_1.default.create({
                userMail: req.body.userMail,
                projects: req.body.projects,
            });
            const newTreatments = yield Treatments_1.default.create({
                projectId: newProject.projects[0]._id,
                treatments: req.body.projects.treatments,
                replications: req.body.projects
                    .replications,
            });
            return res.json({
                response: "New Project Created",
                newTreatments,
                newProject,
            });
        }
        else {
            const updatedProject = yield Projects_1.default.findOneAndUpdate({ userMail }, {
                $push: {
                    projects: req.body.projects,
                },
            }, { new: true });
            if (updatedProject && updatedProject.projects) {
                const newTreatments = yield Treatments_1.default.create({
                    projectId: updatedProject.projects[updatedProject.projects.length - 1]._id,
                    treatments: updatedProject.projects[updatedProject.projects.length - 1].treatments,
                    replications: updatedProject.projects[updatedProject.projects.length - 1].replications,
                });
                return res.json({
                    response: "Project updated",
                    updatedProject,
                });
            }
            else {
                return res.status(404).json({
                    response: "Project not found or missing projects data",
                });
            }
        }
    }
    catch (error) {
        return res.status(500).json({
            response: "Internal Server Error",
            error: error.message,
        });
    }
});
exports.createProject = createProject;
const AddNotes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
    }
    catch (error) {
        response: error;
    }
});
exports.AddNotes = AddNotes;
const FindProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { projectId } = req.params;
        const ProjectName = yield Projects_1.default.findById(projectId);
        res.json({
            response: ProjectName,
        });
    }
    catch (error) {
        res.json({
            response: error,
        });
    }
});
exports.FindProject = FindProject;
const GetAllProjects = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const projects = yield Projects_1.default.find();
        res.json({
            response: projects,
        });
    }
    catch (error) {
        res.json({
            response: error,
        });
    }
});
exports.GetAllProjects = GetAllProjects;
const EditProjectDate = (req, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { projectid, noteId } = req.params;
        const ProjectName = yield Projects_1.default.findById(projectid);
        if (ProjectName) {
            const NoteDetails = ProjectName.notes.find((note) => String(note._id) === noteId);
            if (NoteDetails) {
                response.json({
                    note: NoteDetails,
                });
            }
            else {
                response.json({
                    response: "no Note found",
                });
            }
        }
        else {
            response.json({
                response: "no project found",
            });
        }
    }
    catch (error) {
        response.json({
            response: error,
        });
    }
});
exports.EditProjectDate = EditProjectDate;
const DeleteProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const projectId = req.params.projectId;
    try {
        const deletedProject = yield Projects_1.default.findByIdAndDelete(projectId);
        if (deletedProject) {
            res.json({
                response: projectId + "deleted",
            });
        }
        else {
            res.json({
                response: "no project founnd with the name " + projectId,
            });
        }
    }
    catch (error) {
        res.json({
            response: "No Project Exist with that id",
        });
    }
});
exports.DeleteProject = DeleteProject;
const DeleteNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { noteId, projectId } = req.params;
        const project = yield Projects_1.default.findById(projectId);
        if (project) {
            const noteDetails = project.notes.find((note) => String(note._id) === noteId.toString());
            if (noteDetails) {
                project.notes.pull(noteDetails);
                yield project.save();
                res.json({
                    response: "Note deleted successfully",
                });
            }
            else {
                res.status(404).json({
                    response: "Note not found",
                });
            }
        }
        else {
            res.status(404).json({
                response: "Project not found",
            });
        }
    }
    catch (error) {
        res.status(500).json({
            response: error,
        });
    }
});
exports.DeleteNote = DeleteNote;
const EditNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { noteId, projectId } = req.params;
    const { noteString: UpdatedNotesString } = req.body;
    try {
        const UpdatedNote = yield Projects_1.default.updateOne({
            _id: projectId,
            "notes._id": noteId,
        }, { $set: { "notes.$.noteString": UpdatedNotesString } });
        if (UpdatedNote) {
            res.json({
                response: "note Updated",
            });
        }
        else {
            res.json({
                response: "error",
            });
        }
    }
    catch (error) {
        res.json({
            response: error,
        });
    }
});
exports.EditNote = EditNote;
