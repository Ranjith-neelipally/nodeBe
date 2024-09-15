"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEMPORARY_OTP = exports.TOKEN_KEY = exports.PASSWORD_RESET_LINK = exports.VERIFICATIONEMAIL = exports.MAILTRAP_PASSWORD = exports.MAILTRAP_USER = exports.MONGO_URI = void 0;
const { env } = process;
exports.MONGO_URI = env.MONGO_URI, exports.MAILTRAP_USER = env.MAILTRAP_USER, exports.MAILTRAP_PASSWORD = env.MAILTRAP_PASSWORD, exports.VERIFICATIONEMAIL = env.VERIFICATIONEMAIL, exports.PASSWORD_RESET_LINK = env.PASSWORD_RESET_LINK, exports.TOKEN_KEY = env.TOKEN_KEY, exports.TEMPORARY_OTP = env.TEMPORARY_OTP;
