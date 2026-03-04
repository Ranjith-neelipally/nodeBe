import { AsyncLocalStorage } from "async_hooks";
import { Request, Response, NextFunction } from "express";

export const requestContext = new AsyncLocalStorage<Request>();

export const requestContextMiddleware = (req: Request, res: Response, next: NextFunction) => {
    requestContext.run(req, next);
};
