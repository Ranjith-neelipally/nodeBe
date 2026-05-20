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
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyResetPasswordToken = void 0;
const authTokens_1 = require("../../../utils/authTokens");
const AppError_1 = require("../../../utils/AppError");
const asyncHandler_1 = require("../../../utils/asyncHandler");
const apiResponse_1 = require("../../../utils/apiResponse");
exports.verifyResetPasswordToken = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.body;
    try {
        (0, authTokens_1.verifyAuthToken)(token, "password-reset");
    }
    catch (error) {
        throw new AppError_1.AppError("Token verification failed", 403, "INVALID_RESET_TOKEN");
    }
    return (0, apiResponse_1.sendSuccess)(res, null, 200, "Token is valid");
}));
