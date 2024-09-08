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
const resetPassword_1 = __importDefault(require("../modals/resetPassword"));
const userModal_1 = __importDefault(require("../modals/userModal"));
const variables_1 = require("../utils/variables");
const jsonwebtoken_1 = require("jsonwebtoken");
const verifyResetPasswordToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, userId } = req.body;
    const resetToken = yield resetPassword_1.default.findOne({
        owner: userId,
    });
    if (!resetToken) {
        return res
            .status(403)
            .json({ error: "Invalid reset token for the given user" });
    }
    const tokenMatched = yield resetToken.compareToken(token);
    if (!tokenMatched) {
        return res.status(403).json({ error: "Token verification failed" });
    }
    next();
    res.status(200).json({ message: "Token is valid" });
});
exports.verifyResetPasswordToken = verifyResetPasswordToken;
const verifyLoginToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { authorization } = req.headers;
    const splitToken = (_a = authorization === null || authorization === void 0 ? void 0 : authorization.split("Bearer ")[1]) === null || _a === void 0 ? void 0 : _a.trim();
    if (!splitToken) {
        return res.status(403).json({ error: "Unauthorized Request!" });
    }
    try {
        const details = (0, jsonwebtoken_1.verify)(splitToken, variables_1.TOKEN_KEY);
        const id = details.userId;
        if (!id) {
            return res.status(403).json({ error: "Unauthorized Request!" });
        }
        const user = yield userModal_1.default.findOne({ _id: id, tokens: splitToken });
        if (!user) {
            return res.status(404).json({ response: "Unauthorized Request!" });
        }
        req.user = {
            id: user._id,
            name: user.userName,
            verified: user.verified,
            projects: user.ProjectIds.map((id) => id.toString()),
        };
        req.token = splitToken;
        next();
    }
    catch (error) {
        console.error("JWT Verification Error:", error);
        return res.status(403).json({ error: "Unauthorized Request!" });
    }
});
exports.verifyLoginToken = verifyLoginToken;
