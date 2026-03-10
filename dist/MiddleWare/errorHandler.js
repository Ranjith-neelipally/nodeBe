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
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupProcessErrorHandlers = exports.globalErrorHandler = void 0;
const requestContext_1 = require("./requestContext");
const ErrorLog_1 = require("../modals/ErrorLog");
const globalErrorHandler = (err, req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
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
            body: req.body
        });
    }
    catch (dbErr) {
        console.error("Failed to log error to the database:", dbErr);
    }
    res.status(500).json({ error: "Something went wrong! Error has been logged." });
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
                body: req === null || req === void 0 ? void 0 : req.body
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
                body: req === null || req === void 0 ? void 0 : req.body
            });
        }
        catch (err) {
            console.error("Failed to log uncaught exception to the database:", err);
        }
    }));
};
exports.setupProcessErrorHandlers = setupProcessErrorHandlers;
