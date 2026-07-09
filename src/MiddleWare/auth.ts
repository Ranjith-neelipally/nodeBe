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
