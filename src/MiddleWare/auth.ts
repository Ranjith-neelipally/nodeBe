import { RequestHandler } from "express";
import User from "../modals/userModal";
import { verifyAuthToken } from "../utils/authTokens";
import { AppError } from "../utils/AppError";

export const verifyResetPasswordToken: RequestHandler = async (
  req,
  res,
  next
) => {
  const { token } = req.body;

  try {
    const payload = verifyAuthToken(token, "password-reset");
    req.resetUserId = payload.userId;
  } catch (error) {
    return next(new AppError("Token verification failed", 403, "INVALID_RESET_TOKEN"));
  }

  return next();
};

export const verifyLoginToken: RequestHandler = async (req, res, next) => {
  const { authorization } = req.headers;
  const splitToken = authorization?.split("Bearer ")[1]?.trim();

  if (!splitToken) {
    return next(new AppError("Unauthorized request.", 401, "UNAUTHORIZED"));
  }

  try {
    const details = verifyAuthToken(splitToken, "access");
    const id = details.userId;

    if (!id) {
      return next(new AppError("Unauthorized request.", 401, "UNAUTHORIZED"));
    }

    const user = await User.findById(id);

    if (!user) {
      return next(new AppError("Unauthorized request.", 401, "UNAUTHORIZED"));
    }
    if (!details.sessionId) return next(new AppError("Session refresh required.", 401, "SESSION_REFRESH_REQUIRED"));
    const sessionIsActive = (user.refreshTokens || []).some(
      session => session._id.toString() === details.sessionId && new Date(session.expiresAt).getTime() > Date.now(),
    );
    if (!sessionIsActive) return next(new AppError("Session has ended.", 401, "SESSION_REVOKED"));
    const sessionUpdate: Record<string, unknown> = {
      "refreshTokens.$.lastActiveAt": new Date(),
    };
    if (req.headers["x-client-type"] === "mobile") {
      sessionUpdate["refreshTokens.$.clientType"] = "mobile";
      if (typeof req.headers["x-device-model"] === "string") sessionUpdate["refreshTokens.$.model"] = req.headers["x-device-model"];
      if (typeof req.headers["x-device-platform"] === "string") sessionUpdate["refreshTokens.$.platform"] = req.headers["x-device-platform"];
      if (typeof req.headers["x-device-os-version"] === "string") sessionUpdate["refreshTokens.$.osVersion"] = req.headers["x-device-os-version"];
      if (typeof req.headers["x-device-id"] === "string") sessionUpdate["refreshTokens.$.deviceId"] = req.headers["x-device-id"];
    }
    await User.updateOne(
      { _id: id, "refreshTokens._id": details.sessionId },
      { $set: sessionUpdate },
    );

    req.user = {
      id: user._id,
      name: user.userName,
      verified: user.verified as boolean,
      projects: user.ProjectIds.map((id) => id.toString()),
    };
    req.token = splitToken
    return next();
  } catch (error) {
    return next(error);
  }
};
