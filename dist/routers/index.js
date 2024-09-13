"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRouter = exports.ProjectsRouter = void 0;
const Projects_1 = __importDefault(require("./Projects"));
exports.ProjectsRouter = Projects_1.default;
const auth_1 = __importDefault(require("./auth"));
exports.AuthRouter = auth_1.default;
