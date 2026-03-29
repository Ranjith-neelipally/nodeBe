"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEMPORARY_OTP = exports.PASSWORD_RESET_LINK = exports.VERIFICATIONEMAIL = exports.TOKEN_KEY = exports.ADMIN_MAIL = exports.GMAIL_PASS = exports.GMAIL_USER = exports.MONGO_URI = void 0;
const { env } = process;
const normalizeEnvValue = (value) => {
    if (!value)
        return "";
    return value.trim().replace(/^['"]|['"]$/g, "");
};
exports.MONGO_URI = normalizeEnvValue(env.MONGO_URI);
exports.GMAIL_USER = normalizeEnvValue(env.GMAIL_USER);
exports.GMAIL_PASS = normalizeEnvValue(env.GMAIL_PASS);
exports.ADMIN_MAIL = normalizeEnvValue(env.ADMIN_MAIL);
exports.TOKEN_KEY = normalizeEnvValue(env.TOKEN_KEY);
exports.VERIFICATIONEMAIL = exports.ADMIN_MAIL || exports.GMAIL_USER;
exports.PASSWORD_RESET_LINK = normalizeEnvValue(process.env.PASSWORD_RESET_LINK) || "http://localhost:1430";
exports.TEMPORARY_OTP = normalizeEnvValue(process.env.TEMPORARY_OTP) || "600000";
