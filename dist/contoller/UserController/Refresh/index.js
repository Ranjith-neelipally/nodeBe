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
exports.Refresh = void 0;
const userModal_1 = __importDefault(require("../../../modals/userModal"));
const AppError_1 = require("../../../utils/AppError");
const asyncHandler_1 = require("../../../utils/asyncHandler");
const authTokens_1 = require("../../../utils/authTokens");
const apiResponse_1 = require("../../../utils/apiResponse");
exports.Refresh = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        throw new AppError_1.AppError("Refresh token is required.", 400, "REFRESH_TOKEN_REQUIRED");
    }
    try {
        const payload = (0, authTokens_1.verifyAuthToken)(refreshToken, "refresh");
        const user = yield userModal_1.default.findById(payload.userId);
        if (!user) {
            throw new AppError_1.AppError("Invalid refresh token.", 401, "INVALID_REFRESH_TOKEN");
        }
        user.refreshTokens = (user.refreshTokens || []).filter((stored) => new Date(stored.expiresAt).getTime() > Date.now());
        const tokenIndex = yield (0, authTokens_1.findRefreshTokenIndex)(user.refreshTokens, refreshToken);
        if (tokenIndex === -1) {
            yield user.save();
            throw new AppError_1.AppError("Invalid refresh token.", 401, "INVALID_REFRESH_TOKEN");
        }
        user.refreshTokens.splice(tokenIndex, 1);
        const accessToken = (0, authTokens_1.signAccessToken)(user._id.toString());
        const nextRefreshToken = (0, authTokens_1.signRefreshToken)(user._id.toString());
        user.refreshTokens.push({
            token: yield (0, authTokens_1.hashRefreshToken)(nextRefreshToken),
            device: typeof req.headers["user-agent"] === "string"
                ? req.headers["user-agent"]
                : undefined,
            createdAt: new Date(),
            expiresAt: (0, authTokens_1.getRefreshTokenExpiry)(),
        });
        yield user.save();
        return (0, apiResponse_1.sendSuccess)(res, {
            accessToken,
            refreshToken: nextRefreshToken,
            token: accessToken,
        });
    }
    catch (error) {
        if (error instanceof AppError_1.AppError)
            throw error;
        throw new AppError_1.AppError("Invalid refresh token.", 401, "INVALID_REFRESH_TOKEN");
    }
}));
