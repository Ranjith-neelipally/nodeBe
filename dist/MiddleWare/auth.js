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
exports.verifyLoginToken = exports.verifyResetPasswordToken = void 0;
const userModal_1 = __importDefault(require("../modals/userModal"));
const authTokens_1 = require("../utils/authTokens");
const AppError_1 = require("../utils/AppError");
const verifyResetPasswordToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.body;
    try {
        const payload = (0, authTokens_1.verifyAuthToken)(token, "password-reset");
        req.resetUserId = payload.userId;
    }
    catch (error) {
        return next(new AppError_1.AppError("Token verification failed", 403, "INVALID_RESET_TOKEN"));
    }
    return next();
});
exports.verifyResetPasswordToken = verifyResetPasswordToken;
const verifyLoginToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { authorization } = req.headers;
    const splitToken = (_a = authorization === null || authorization === void 0 ? void 0 : authorization.split("Bearer ")[1]) === null || _a === void 0 ? void 0 : _a.trim();
    if (!splitToken) {
        return next(new AppError_1.AppError("Unauthorized request.", 401, "UNAUTHORIZED"));
    }
    try {
        const details = (0, authTokens_1.verifyAuthToken)(splitToken, "access");
        const id = details.userId;
        if (!id) {
            return next(new AppError_1.AppError("Unauthorized request.", 401, "UNAUTHORIZED"));
        }
        const user = yield userModal_1.default.findById(id);
        if (!user) {
            return next(new AppError_1.AppError("Unauthorized request.", 401, "UNAUTHORIZED"));
        }
        req.user = {
            id: user._id,
            name: user.userName,
            verified: user.verified,
            projects: user.ProjectIds.map((id) => id.toString()),
        };
        req.token = splitToken;
        return next();
    }
    catch (error) {
        return next(error);
    }
});
exports.verifyLoginToken = verifyLoginToken;
