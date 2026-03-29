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
exports.sendSuccessEmail = exports.sendPasswordResetMail = exports.sendVerificationMail = void 0;
const WelcomeMail_1 = require("../mail/WelcomeMail");
const variables_1 = require("../utils/variables");
const nodemailer_1 = __importDefault(require("nodemailer"));
const getSenderAddress = () => {
    if (!variables_1.GMAIL_USER) {
        throw new Error("Missing GMAIL_USER environment variable for email transport.");
    }
    return variables_1.VERIFICATIONEMAIL && variables_1.VERIFICATIONEMAIL.toLowerCase() === variables_1.GMAIL_USER.toLowerCase()
        ? variables_1.VERIFICATIONEMAIL
        : variables_1.GMAIL_USER;
};
const createTransporter = () => {
    if (!variables_1.GMAIL_USER || !variables_1.GMAIL_PASS) {
        throw new Error("Missing GMAIL_USER or GMAIL_PASS environment variables for Gmail authentication.");
    }
    const cleanPassword = variables_1.GMAIL_PASS.replace(/\s/g, "");
    return nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: variables_1.GMAIL_USER,
            pass: cleanPassword,
        },
    });
};
const sendEmailViaGmail = (mailOptions) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transporter = createTransporter();
        const info = yield transporter.sendMail(Object.assign(Object.assign({}, mailOptions), { from: getSenderAddress(), replyTo: mailOptions.replyTo || mailOptions.from }));
        console.log(`✓ Email sent to ${mailOptions.to}:`, info.response);
    }
    catch (error) {
        console.error(`✗ Failed to send email to ${mailOptions.to}:`, error);
        if (error instanceof Error && "code" in error && error.code === "EAUTH") {
            throw new Error("Gmail authentication failed. Verify that GMAIL_USER matches the Google account that generated the App Password, 2-Step Verification is enabled on that account, and GMAIL_PASS is the 16-character App Password.");
        }
        throw error;
    }
});
const sendVerificationMail = (token, profile) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, userId } = profile;
    yield sendEmailViaGmail({
        to: email,
        from: variables_1.VERIFICATIONEMAIL,
        html: (0, WelcomeMail_1.Email)({
            Otp: `Your OTP: ${token}`,
            userName: name,
            subject: "Verification Mail",
            message: "You are just a step away from accessing your research Pal account, We are sharing a verification code to access your account. The code is valid for 10 minutes and usable only once.",
        }),
    });
});
exports.sendVerificationMail = sendVerificationMail;
const sendPasswordResetMail = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const { link, email } = options;
    yield sendEmailViaGmail({
        to: email,
        from: variables_1.VERIFICATIONEMAIL,
        html: (0, WelcomeMail_1.Email)({
            userName: email,
            subject: "Reset Password Link",
            button: link,
            message: "We just recieved a request that you forgot your password. Click on the link and reset your password.",
            title: "Forgot password",
        }),
    });
});
exports.sendPasswordResetMail = sendPasswordResetMail;
const sendSuccessEmail = (profile) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email } = profile;
    yield sendEmailViaGmail({
        to: email,
        from: variables_1.VERIFICATIONEMAIL,
        html: (0, WelcomeMail_1.Email)({
            userName: name,
            subject: "Success Mail",
            message: "Your password has been changed successfully!",
        }),
    });
});
exports.sendSuccessEmail = sendSuccessEmail;
