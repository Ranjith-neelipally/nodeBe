import { Request, Response, NextFunction } from "express";
import { requestContext } from "./requestContext";
import { ErrorLog } from "../modals/ErrorLog";
import { AppError } from "../utils/AppError";
import { sendError } from "../utils/apiResponse";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import mongoose from "mongoose";

const isProduction = process.env.NODE_ENV === "production";

const redactBody = (body: any) => {
    if (!body || typeof body !== "object") return body;

    const redacted = { ...body };
    ["password", "token", "refreshToken", "verificationToken", "code"].forEach((key) => {
        if (key in redacted) redacted[key] = "[REDACTED]";
    });

    return redacted;
};

const normalizeError = (err: any) => {
    if (err instanceof AppError) {
        return err;
    }

    if (err instanceof TokenExpiredError) {
        return new AppError("Your session has expired.", 401, "TOKEN_EXPIRED");
    }

    if (err instanceof JsonWebTokenError) {
        return new AppError("Invalid authentication token.", 401, "INVALID_TOKEN");
    }

    if (err instanceof mongoose.Error.ValidationError) {
        return new AppError(
            "Validation failed.",
            422,
            "VALIDATION_ERROR",
            Object.values(err.errors).map((error) => error.message),
        );
    }

    if (err instanceof mongoose.Error.CastError) {
        return new AppError("Invalid resource identifier.", 400, "INVALID_ID");
    }

    if (err?.code === 11000) {
        return new AppError("A record with this value already exists.", 409, "DUPLICATE_RECORD");
    }

    return new AppError("Something went wrong.", 500, "INTERNAL_SERVER_ERROR");
};

export const globalErrorHandler = async (err: Error, req: any, res: Response, next: NextFunction) => {
    const normalizedError = normalizeError(err);
    const shouldLog = normalizedError.statusCode >= 500 || !normalizedError.isOperational;

    try {
        if (shouldLog) {
            await ErrorLog.create({
                message: err.message || "An unknown error occurred",
                stack: err.stack,
                route: req.originalUrl,
                method: req.method,
                userId: req.user?.id,
                userAgent: req.headers["user-agent"],
                ip: req.ip || req.connection?.remoteAddress,
                country: req.headers["cf-ipcountry"] || req.headers["x-vercel-ip-country"] || "Unknown",
                headers: req.headers,
                email: req.body?.email,
                body: redactBody(req.body),
                requestId: req.requestId,
            });
        }
    } catch (dbErr) {
        console.error("Failed to log error to the database:", dbErr);
    }

    if (!isProduction || shouldLog) {
        console.error(`[${req.requestId || "no-request-id"}]`, err);
    }

    if (res.headersSent) {
        return next(err);
    }

    return sendError(
        res,
        normalizedError.statusCode,
        normalizedError.code,
        normalizedError.message,
        isProduction && normalizedError.statusCode >= 500
            ? undefined
            : normalizedError.details,
    );
};

export const setupProcessErrorHandlers = () => {
    process.on("unhandledRejection", async (reason: any, promise) => {
        console.error("Unhandled Rejection:", reason);
        const req: any = requestContext.getStore();

        try {
            await ErrorLog.create({
                message: reason?.message || "Unhandled Promise Rejection",
                stack: reason?.stack || (typeof reason === 'string' ? reason : JSON.stringify(reason)),
                route: req?.originalUrl || "Background Task / Async",
                method: "unhandledRejection",
                userId: req?.user?.id,
                userAgent: req?.headers?.["user-agent"],
                ip: req?.ip || req?.connection?.remoteAddress,
                country: req?.headers?.["cf-ipcountry"] || req?.headers?.["x-vercel-ip-country"] || "Unknown",
                headers: req?.headers,
                email: req?.body?.email,
                body: redactBody(req?.body),
                requestId: req?.requestId,
            });
        } catch (err) {
            console.error("Failed to log unhandled rejection to the database:", err);
        }
        // We don't exit the process here to keep the app running as requested
    });

    process.on("uncaughtException", async (error: Error) => {
        console.error("Uncaught Exception:", error);
        const req: any = requestContext.getStore();

        try {
            await ErrorLog.create({
                message: error.message || "Uncaught Exception",
                stack: error.stack,
                route: req?.originalUrl || "Background Task / Sync",
                method: "uncaughtException",
                userId: req?.user?.id,
                userAgent: req?.headers?.["user-agent"],
                ip: req?.ip || req?.connection?.remoteAddress,
                country: req?.headers?.["cf-ipcountry"] || req?.headers?.["x-vercel-ip-country"] || "Unknown",
                headers: req?.headers,
                email: req?.body?.email,
                body: redactBody(req?.body),
                requestId: req?.requestId,
            });
        } catch (err) {
            console.error("Failed to log uncaught exception to the database:", err);
        }
        // We don't exit the process here to keep the app running as requested
    });
};
