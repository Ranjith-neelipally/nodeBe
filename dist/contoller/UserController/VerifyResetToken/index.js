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
exports.verifyResetPasswordToken = void 0;
const resetPassword_1 = __importDefault(require("../../../modals/resetPassword"));
const verifyResetPasswordToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    res.status(200).json({ message: "Token is valid" });
});
exports.verifyResetPasswordToken = verifyResetPasswordToken;
