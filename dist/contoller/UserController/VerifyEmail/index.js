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
const userVerification_1 = __importDefault(require("../../../modals/userVerification"));
const userModal_1 = __importDefault(require("../../../modals/userModal"));
const helpers_1 = require("../../../utils/helpers");
const mail_1 = require("../../../utils/mail");
const VerifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, token } = req.body;
    const verificationToken = yield userVerification_1.default.findOne({
        owner: userId,
    });
    if (!verificationToken) {
        return res.status(403).json({ error: "Inavid Token" });
    }
    const matched = yield verificationToken.compareToken(token);
    if (!matched) {
        return res.status(403).json({ error: "Inavid Token" });
    }
    yield userModal_1.default.findByIdAndUpdate(userId, {
        verified: true,
    });
    yield userVerification_1.default.findByIdAndDelete(verificationToken._id);
    res.json({ message: "Email is Verified" });
});
exports.VerifyEmail = VerifyEmail;
const mongoose_1 = __importDefault(require("mongoose"));
const ResendVerificationEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    if (!mongoose_1.default.isValidObjectId(userId)) {
        return res.status(403).json({ error: "Invalid request!" });
    }
    const user = yield userModal_1.default.findById(userId);
    if (!user) {
        return res.status(404).json({ error: "User not found!" });
    }
    yield userVerification_1.default.findOneAndDelete({
        owner: userId,
    });
    const token = (0, helpers_1.generateToken)(6);
    yield userVerification_1.default.create({
        owner: userId,
        token,
    });
    (0, mail_1.sendVerificationMail)(token, {
        name: user.userName,
        email: user.email,
        userId: user._id.toString(),
    });
    res.json({
        message: "Please check your email for verification instructions.",
    });
});
exports.ResendVerificationEmail = ResendVerificationEmail;
