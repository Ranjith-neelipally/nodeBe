import { AsyncLocalStorage } from "async_hooks";
import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

export const requestContext = new AsyncLocalStorage<Request>();

export const requestContextMiddleware = (req: Request, res: Response, next: NextFunction) => {
    req.requestId = crypto.randomUUID();
    res.setHeader("x-request-id", req.requestId);
    requestContext.run(req, next);
};
