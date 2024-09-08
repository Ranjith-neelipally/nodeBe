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
exports.GenerateResetPasswordLink = void 0;
const resetPassword_1 = __importDefault(require("../../../modals/resetPassword"));
const userModal_1 = __importDefault(require("../../../modals/userModal"));
const crypto_1 = __importDefault(require("crypto"));
const variables_1 = require("../../../utils/variables");
const mail_1 = require("../../../utils/mail");
const GenerateResetPasswordLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const user = yield userModal_1.default.findOne({ email });
    if (!user) {
        return res.status(404).json({ error: "Account not found" });
    }
    const resetToken = crypto_1.default.randomBytes(36).toString("hex");
    yield resetPassword_1.default.create({
        owner: user._id,
        token: resetToken,
    });
    const resetLink = `${variables_1.PASSWORD_RESET_LINK}?token=${resetToken}&userId=${user._id}`;
    try {
        (0, mail_1.sendPasswordResetMail)({
            name: user.userName,
            email: user.email,
            link: resetLink,
        });
        res.json({ resetLink: resetLink });
    }
    catch (error) {
        res.json({ message: error });
    }
});
exports.GenerateResetPasswordLink = GenerateResetPasswordLink;
