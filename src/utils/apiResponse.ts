import { Response } from "express";

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  requestId?: string;
}

export interface ApiSuccessBody<T> {
  success: true;
  data: T;
  message?: string;
  requestId?: string;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode = 200,
  message?: string,
) =>
  res.status(statusCode).json({
    success: true,
    data,
    ...(message ? { message } : {}),
    requestId: (res.req as any).requestId,
  } satisfies ApiSuccessBody<T>);

export const sendError = (
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown,
) =>
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(typeof details !== "undefined" ? { details } : {}),
    },
    requestId: (res.req as any).requestId,
  } satisfies ApiErrorBody);
