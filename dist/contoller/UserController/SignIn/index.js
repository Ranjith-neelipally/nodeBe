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
exports.SignIn = void 0;
const userModal_1 = __importDefault(require("../../../modals/userModal"));
const AppError_1 = require("../../../utils/AppError");
const asyncHandler_1 = require("../../../utils/asyncHandler");
const authTokens_1 = require("../../../utils/authTokens");
const apiResponse_1 = require("../../../utils/apiResponse");
exports.SignIn = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield userModal_1.default.findOne({ email });
    if (!user) {
        throw new AppError_1.AppError("User/Password mismatch", 403, "INVALID_CREDENTIALS");
    }
    const matched = yield user.comparePassword(password);
    if (!matched) {
        throw new AppError_1.AppError("User/Password mismatch", 403, "INVALID_CREDENTIALS");
    }
    if (!user.verified) {
        throw new AppError_1.AppError("Please verify your email before signing in. Check your email for verification instructions.", 403, "PROFILE_NOT_VERIFIED", { verified: false });
    }
    const accessToken = (0, authTokens_1.signAccessToken)(user._id.toString());
    const refreshToken = (0, authTokens_1.signRefreshToken)(user._id.toString());
    user.refreshTokens = (user.refreshTokens || []).filter((stored) => new Date(stored.expiresAt).getTime() > Date.now());
    user.refreshTokens.push({
        token: yield (0, authTokens_1.hashRefreshToken)(refreshToken),
        device: typeof req.headers["user-agent"] === "string"
            ? req.headers["user-agent"]
            : undefined,
        createdAt: new Date(),
        expiresAt: (0, authTokens_1.getRefreshTokenExpiry)(),
    });
    yield user.save();
    return (0, apiResponse_1.sendSuccess)(res, {
        profile: {
            id: user._id,
            name: user.userName,
            verified: user.verified,
            projects: user.ProjectIds,
            email: user.email,
            createdAt: user.createdAt || user._id.getTimestamp(),
        },
        accessToken,
        refreshToken,
        token: accessToken,
    });
}));
