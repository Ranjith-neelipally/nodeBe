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
exports.Logout = void 0;
const userModal_1 = __importDefault(require("../../../modals/userModal"));
const AppError_1 = require("../../../utils/AppError");
const asyncHandler_1 = require("../../../utils/asyncHandler");
const authTokens_1 = require("../../../utils/authTokens");
const apiResponse_1 = require("../../../utils/apiResponse");
exports.Logout = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fromAll } = req.query;
    const { refreshToken } = req.body;
    const user = yield userModal_1.default.findById(req.user.id);
    if (!user)
        throw new AppError_1.AppError("Unauthorized request.", 401, "UNAUTHORIZED");
    if (fromAll === "yes") {
        user.refreshTokens = [];
    }
    else if (refreshToken) {
        const tokenIndex = yield (0, authTokens_1.findRefreshTokenIndex)(user.refreshTokens || [], refreshToken);
        if (tokenIndex !== -1) {
            user.refreshTokens.splice(tokenIndex, 1);
        }
    }
    yield user.save();
    return (0, apiResponse_1.sendSuccess)(res, null, 200, "Logout successful");
}));
