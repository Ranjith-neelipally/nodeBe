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
exports.UpdatePassword = void 0;
const userModal_1 = __importDefault(require("../../../modals/userModal"));
const mail_1 = require("../../../utils/mail");
const AppError_1 = require("../../../utils/AppError");
const asyncHandler_1 = require("../../../utils/asyncHandler");
const apiResponse_1 = require("../../../utils/apiResponse");
exports.UpdatePassword = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { password } = req.body;
    const userId = req.resetUserId;
    if (!userId) {
        throw new AppError_1.AppError("Unauthorised Access", 403, "UNAUTHORIZED");
    }
    const user = yield userModal_1.default.findById(userId);
    if (!user) {
        throw new AppError_1.AppError("Unauthorised Access", 403, "UNAUTHORIZED");
    }
    const matched = yield user.comparePassword(password);
    if (matched) {
        throw new AppError_1.AppError("New password must be unique.", 422, "PASSWORD_REUSED");
    }
    user.password = password;
    yield user.save();
    yield (0, mail_1.sendSuccessEmail)({
        name: user.userName,
        email: user.email
    });
    return (0, apiResponse_1.sendSuccess)(res, null, 200, "Password Updated");
}));
