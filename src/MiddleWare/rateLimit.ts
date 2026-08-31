import rateLimit from "express-rate-limit";
import { sendError } from "../utils/apiResponse";

const authRateLimitHandler = (_req: any, res: any) =>
  sendError(
    res,
    429,
    "RATE_LIMITED",
    "Too many attempts. Please wait and try again.",
  );

export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: authRateLimitHandler,
});

export const refreshRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: authRateLimitHandler,
});

export const emailAuthRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: authRateLimitHandler,
});

export const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: authRateLimitHandler,
});

export const accountDeletionRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 3,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: req => req.user?.id?.toString() || req.ip || "anonymous",
  handler: authRateLimitHandler,
});
