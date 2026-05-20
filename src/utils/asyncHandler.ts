import { NextFunction, Request, Response } from "express";

export const asyncHandler =
  (handler: (req: any, res: Response, next: NextFunction) => Promise<any> | any) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(handler(req, res, next)).catch(next);
