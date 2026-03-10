"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEMPORARY_OTP = exports.TOKEN_KEY = exports.PASSWORD_RESET_LINK = exports.VERIFICATIONEMAIL = exports.GMAIL_PASS = exports.GMAIL_USER = exports.MONGO_URI = void 0;
const { env } = process;
exports.MONGO_URI = env.MONGO_URI, exports.GMAIL_USER = env.GMAIL_USER, exports.GMAIL_PASS = env.GMAIL_PASS, exports.VERIFICATIONEMAIL = env.VERIFICATIONEMAIL, exports.PASSWORD_RESET_LINK = env.PASSWORD_RESET_LINK, exports.TOKEN_KEY = env.TOKEN_KEY, exports.TEMPORARY_OTP = env.TEMPORARY_OTP;
