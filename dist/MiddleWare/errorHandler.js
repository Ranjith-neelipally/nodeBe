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
exports.setupProcessErrorHandlers = exports.globalErrorHandler = void 0;
const requestContext_1 = require("./requestContext");
const ErrorLog_1 = require("../modals/ErrorLog");
const AppError_1 = require("../utils/AppError");
const apiResponse_1 = require("../utils/apiResponse");
const jsonwebtoken_1 = require("jsonwebtoken");
const mongoose_1 = __importDefault(require("mongoose"));
const isProduction = process.env.NODE_ENV === "production";
const redactBody = (body) => {
    if (!body || typeof body !== "object")
        return body;
    const redacted = Object.assign({}, body);
    ["password", "token", "refreshToken", "verificationToken", "code"].forEach((key) => {
        if (key in redacted)
            redacted[key] = "[REDACTED]";
    });
    return redacted;
};
const normalizeError = (err) => {
    if (err instanceof AppError_1.AppError) {
        return err;
    }
    if (err instanceof jsonwebtoken_1.TokenExpiredError) {
        return new AppError_1.AppError("Your session has expired.", 401, "TOKEN_EXPIRED");
    }
    if (err instanceof jsonwebtoken_1.JsonWebTokenError) {
        return new AppError_1.AppError("Invalid authentication token.", 401, "INVALID_TOKEN");
    }
    if (err instanceof mongoose_1.default.Error.ValidationError) {
        return new AppError_1.AppError("Validation failed.", 422, "VALIDATION_ERROR", Object.values(err.errors).map((error) => error.message));
    }
    if (err instanceof mongoose_1.default.Error.CastError) {
        return new AppError_1.AppError("Invalid resource identifier.", 400, "INVALID_ID");
    }
    if ((err === null || err === void 0 ? void 0 : err.code) === 11000) {
        return new AppError_1.AppError("A record with this value already exists.", 409, "DUPLICATE_RECORD");
    }
    return new AppError_1.AppError("Something went wrong.", 500, "INTERNAL_SERVER_ERROR");
};
const globalErrorHandler = (err, req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const normalizedError = normalizeError(err);
    const shouldLog = normalizedError.statusCode >= 500 || !normalizedError.isOperational;
    try {
        if (shouldLog) {
            yield ErrorLog_1.ErrorLog.create({
                message: err.message || "An unknown error occurred",
                stack: err.stack,
                route: req.originalUrl,
                method: req.method,
                userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                userAgent: req.headers["user-agent"],
                ip: req.ip || ((_b = req.connection) === null || _b === void 0 ? void 0 : _b.remoteAddress),
                country: req.headers["cf-ipcountry"] || req.headers["x-vercel-ip-country"] || "Unknown",
                headers: req.headers,
                email: (_c = req.body) === null || _c === void 0 ? void 0 : _c.email,
                body: redactBody(req.body),
                requestId: req.requestId,
            });
        }
    }
    catch (dbErr) {
        console.error("Failed to log error to the database:", dbErr);
    }
    if (!isProduction || shouldLog) {
        console.error(`[${req.requestId || "no-request-id"}]`, err);
    }
    if (res.headersSent) {
        return next(err);
    }
    return (0, apiResponse_1.sendError)(res, normalizedError.statusCode, normalizedError.code, normalizedError.message, isProduction && normalizedError.statusCode >= 500
        ? undefined
        : normalizedError.details);
});
exports.globalErrorHandler = globalErrorHandler;
const setupProcessErrorHandlers = () => {
    process.on("unhandledRejection", (reason, promise) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f;
        console.error("Unhandled Rejection:", reason);
        const req = requestContext_1.requestContext.getStore();
        try {
            yield ErrorLog_1.ErrorLog.create({
                message: (reason === null || reason === void 0 ? void 0 : reason.message) || "Unhandled Promise Rejection",
                stack: (reason === null || reason === void 0 ? void 0 : reason.stack) || (typeof reason === 'string' ? reason : JSON.stringify(reason)),
                route: (req === null || req === void 0 ? void 0 : req.originalUrl) || "Background Task / Async",
                method: "unhandledRejection",
                userId: (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id,
                userAgent: (_b = req === null || req === void 0 ? void 0 : req.headers) === null || _b === void 0 ? void 0 : _b["user-agent"],
                ip: (req === null || req === void 0 ? void 0 : req.ip) || ((_c = req === null || req === void 0 ? void 0 : req.connection) === null || _c === void 0 ? void 0 : _c.remoteAddress),
                country: ((_d = req === null || req === void 0 ? void 0 : req.headers) === null || _d === void 0 ? void 0 : _d["cf-ipcountry"]) || ((_e = req === null || req === void 0 ? void 0 : req.headers) === null || _e === void 0 ? void 0 : _e["x-vercel-ip-country"]) || "Unknown",
                headers: req === null || req === void 0 ? void 0 : req.headers,
                email: (_f = req === null || req === void 0 ? void 0 : req.body) === null || _f === void 0 ? void 0 : _f.email,
                body: redactBody(req === null || req === void 0 ? void 0 : req.body),
                requestId: req === null || req === void 0 ? void 0 : req.requestId,
            });
        }
        catch (err) {
            console.error("Failed to log unhandled rejection to the database:", err);
        }
    }));
    process.on("uncaughtException", (error) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f;
        console.error("Uncaught Exception:", error);
        const req = requestContext_1.requestContext.getStore();
        try {
            yield ErrorLog_1.ErrorLog.create({
                message: error.message || "Uncaught Exception",
                stack: error.stack,
                route: (req === null || req === void 0 ? void 0 : req.originalUrl) || "Background Task / Sync",
                method: "uncaughtException",
                userId: (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id,
                userAgent: (_b = req === null || req === void 0 ? void 0 : req.headers) === null || _b === void 0 ? void 0 : _b["user-agent"],
                ip: (req === null || req === void 0 ? void 0 : req.ip) || ((_c = req === null || req === void 0 ? void 0 : req.connection) === null || _c === void 0 ? void 0 : _c.remoteAddress),
                country: ((_d = req === null || req === void 0 ? void 0 : req.headers) === null || _d === void 0 ? void 0 : _d["cf-ipcountry"]) || ((_e = req === null || req === void 0 ? void 0 : req.headers) === null || _e === void 0 ? void 0 : _e["x-vercel-ip-country"]) || "Unknown",
                headers: req === null || req === void 0 ? void 0 : req.headers,
                email: (_f = req === null || req === void 0 ? void 0 : req.body) === null || _f === void 0 ? void 0 : _f.email,
                body: redactBody(req === null || req === void 0 ? void 0 : req.body),
                requestId: req === null || req === void 0 ? void 0 : req.requestId,
            });
        }
        catch (err) {
            console.error("Failed to log uncaught exception to the database:", err);
        }
    }));
};
exports.setupProcessErrorHandlers = setupProcessErrorHandlers;
