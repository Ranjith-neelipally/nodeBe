import { Request, Response, NextFunction } from "express";
import { requestContext } from "./requestContext";
import { ErrorLog } from "../modals/ErrorLog";

export const globalErrorHandler = async (err: Error, req: any, res: Response, next: NextFunction) => {
    try {
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
            body: req.body
        });
    } catch (dbErr) {
        console.error("Failed to log error to the database:", dbErr);
    }

    res.status(500).json({ error: "Something went wrong! Error has been logged." });
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
                body: req?.body
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
                body: req?.body
            });
        } catch (err) {
            console.error("Failed to log uncaught exception to the database:", err);
        }
        // We don't exit the process here to keep the app running as requested
    });
};
