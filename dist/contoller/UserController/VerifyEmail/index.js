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
exports.ResendVerificationEmail = exports.VerifyEmail = void 0;
const userModal_1 = __importDefault(require("../../../modals/userModal"));
const helpers_1 = require("../../../utils/helpers");
const mail_1 = require("../../../utils/mail");
const authTokens_1 = require("../../../utils/authTokens");
const mongoose_1 = __importDefault(require("mongoose"));
const AppError_1 = require("../../../utils/AppError");
const asyncHandler_1 = require("../../../utils/asyncHandler");
const apiResponse_1 = require("../../../utils/apiResponse");
exports.VerifyEmail = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, code, verificationToken } = req.body;
    if (typeof code !== "string" || code.trim() === "") {
        throw new AppError_1.AppError("Verification code is required.", 403, "INVALID_VERIFICATION_CODE");
    }
    if (!verificationToken) {
        throw new AppError_1.AppError("Invalid token", 403, "INVALID_VERIFICATION_TOKEN");
    }
    const payload = (0, authTokens_1.verifyAuthToken)(verificationToken, "email-verification");
    if (userId && payload.userId !== userId) {
        throw new AppError_1.AppError("Invalid token", 403, "INVALID_VERIFICATION_TOKEN");
    }
    if (!payload.codeHash) {
        throw new AppError_1.AppError("Invalid token", 403, "INVALID_VERIFICATION_TOKEN");
    }
    const matched = yield (0, authTokens_1.compareEmailCode)(code.trim(), payload.codeHash);
    if (!matched) {
        throw new AppError_1.AppError("Invalid token", 403, "INVALID_VERIFICATION_TOKEN");
    }
    yield userModal_1.default.findByIdAndUpdate(payload.userId, {
        verified: true,
    });
    return (0, apiResponse_1.sendSuccess)(res, null, 200, "Email is verified");
}));
exports.ResendVerificationEmail = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    if (!mongoose_1.default.isValidObjectId(userId)) {
        throw new AppError_1.AppError("Invalid request.", 403, "INVALID_REQUEST");
    }
    const user = yield userModal_1.default.findById(userId);
    if (!user) {
        throw new AppError_1.AppError("User not found.", 404, "USER_NOT_FOUND");
    }
    const token = (0, helpers_1.generateToken)(6);
    const verificationToken = (0, authTokens_1.signEmailVerificationToken)(user._id.toString(), yield (0, authTokens_1.hashEmailCode)(token));
    yield (0, mail_1.sendVerificationMail)(token, {
        name: user.userName,
        email: user.email,
        userId: user._id.toString(),
    });
    return (0, apiResponse_1.sendSuccess)(res, {
        verificationToken,
    }, 200, "Please check your email for verification instructions.");
}));
