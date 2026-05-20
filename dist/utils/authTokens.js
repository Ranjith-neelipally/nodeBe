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
exports.findRefreshTokenIndex = exports.verifyAuthToken = exports.compareEmailCode = exports.hashEmailCode = exports.hashRefreshToken = exports.signPasswordResetToken = exports.signEmailVerificationToken = exports.signRefreshToken = exports.signAccessToken = exports.getRefreshTokenExpiry = void 0;
const bcryptjs_1 = require("bcryptjs");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const variables_1 = require("./variables");
const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "30d";
const EMAIL_VERIFICATION_EXPIRES_IN = "10m";
const PASSWORD_RESET_EXPIRES_IN = "1h";
const REFRESH_TOKEN_DAYS = 30;
const getRefreshTokenExpiry = () => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_DAYS);
    return expiresAt;
};
exports.getRefreshTokenExpiry = getRefreshTokenExpiry;
const signAccessToken = (userId) => jsonwebtoken_1.default.sign({ userId, type: "access" }, variables_1.TOKEN_KEY, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
});
exports.signAccessToken = signAccessToken;
const signRefreshToken = (userId) => jsonwebtoken_1.default.sign({ userId, type: "refresh" }, variables_1.TOKEN_KEY, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
});
exports.signRefreshToken = signRefreshToken;
const signEmailVerificationToken = (userId, codeHash) => jsonwebtoken_1.default.sign({ userId, codeHash, type: "email-verification" }, variables_1.TOKEN_KEY, {
    expiresIn: EMAIL_VERIFICATION_EXPIRES_IN,
});
exports.signEmailVerificationToken = signEmailVerificationToken;
const signPasswordResetToken = (userId) => jsonwebtoken_1.default.sign({ userId, type: "password-reset" }, variables_1.TOKEN_KEY, {
    expiresIn: PASSWORD_RESET_EXPIRES_IN,
});
exports.signPasswordResetToken = signPasswordResetToken;
const hashRefreshToken = (token) => (0, bcryptjs_1.hash)(token, 10);
exports.hashRefreshToken = hashRefreshToken;
const hashEmailCode = (code) => (0, bcryptjs_1.hash)(code, 10);
exports.hashEmailCode = hashEmailCode;
const compareEmailCode = (code, codeHash) => (0, bcryptjs_1.compare)(code, codeHash);
exports.compareEmailCode = compareEmailCode;
const verifyAuthToken = (token, expectedType) => {
    const payload = jsonwebtoken_1.default.verify(token, variables_1.TOKEN_KEY);
    if (payload.type !== expectedType || !payload.userId) {
        throw new Error("Invalid token type");
    }
    return payload;
};
exports.verifyAuthToken = verifyAuthToken;
const findRefreshTokenIndex = (refreshTokens, token) => __awaiter(void 0, void 0, void 0, function* () {
    const now = Date.now();
    for (let i = 0; i < refreshTokens.length; i += 1) {
        const stored = refreshTokens[i];
        if (new Date(stored.expiresAt).getTime() <= now)
            continue;
        if (yield (0, bcryptjs_1.compare)(token, stored.token)) {
            return i;
        }
    }
    return -1;
});
exports.findRefreshTokenIndex = findRefreshTokenIndex;
