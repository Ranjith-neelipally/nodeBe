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
exports.GetUser = void 0;
const userModal_1 = __importDefault(require("../../../modals/userModal"));
const AppError_1 = require("../../../utils/AppError");
const asyncHandler_1 = require("../../../utils/asyncHandler");
const apiResponse_1 = require("../../../utils/apiResponse");
exports.GetUser = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield userModal_1.default.findById(req.user.id);
    if (!user) {
        throw new AppError_1.AppError("User not found.", 404, "USER_NOT_FOUND");
    }
    return (0, apiResponse_1.sendSuccess)(res, {
        profile: {
            id: user._id,
            name: user.userName,
            verified: user.verified,
            projects: user.ProjectIds,
            email: user.email,
            createdAt: user.createdAt || user._id.getTimestamp(),
        },
    });
}));
