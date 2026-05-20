"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshModalsRouter = exports.SyncRouter = exports.PhotosRouter = exports.IdeasRouter = exports.AuthRouter = exports.ProjectsRouter = void 0;
const Projects_1 = __importDefault(require("./Projects"));
exports.ProjectsRouter = Projects_1.default;
const auth_1 = __importDefault(require("./auth"));
exports.AuthRouter = auth_1.default;
const Ideas_1 = __importDefault(require("./Ideas"));
exports.IdeasRouter = Ideas_1.default;
const Photos_1 = __importDefault(require("./Photos"));
exports.PhotosRouter = Photos_1.default;
const sync_1 = __importDefault(require("./sync"));
exports.SyncRouter = sync_1.default;
const refreshDatabase_1 = __importDefault(require("../db/refreshDatabase"));
exports.RefreshModalsRouter = refreshDatabase_1.default;
