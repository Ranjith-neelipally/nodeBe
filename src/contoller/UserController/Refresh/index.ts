import User from "../../../modals/userModal";
import { AppError } from "../../../utils/AppError";
import { asyncHandler } from "../../../utils/asyncHandler";
import {
  compareRefreshToken,
  getRefreshTokenExpiry,
  hashRefreshToken,
  signAccessToken,
  signRefreshToken,
  verifyAuthToken,
} from "../../../utils/authTokens";
import { sendSuccess } from "../../../utils/apiResponse";

export const Refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body as { refreshToken?: string };

  if (!refreshToken) {
    throw new AppError("Refresh token is required.", 400, "REFRESH_TOKEN_REQUIRED");
  }

  try {
    const payload = verifyAuthToken(refreshToken, "refresh");
    if (!payload.sessionId) {
      throw new AppError("Invalid refresh token.", 401, "INVALID_REFRESH_TOKEN");
    }
    const user = await User.findById(payload.userId);

    if (!user) {
      throw new AppError("Invalid refresh token.", 401, "INVALID_REFRESH_TOKEN");
    }

    const session = (user.refreshTokens || []).find(
      (stored) => stored._id.toString() === payload.sessionId,
    );
    if (!session || new Date(session.expiresAt).getTime() <= Date.now()) {
      throw new AppError("Invalid refresh token.", 401, "INVALID_REFRESH_TOKEN");
    }
    const sessionId = session._id.toString();
    if (!(await compareRefreshToken(refreshToken, session.token))) {
      throw new AppError("Invalid refresh token.", 401, "INVALID_REFRESH_TOKEN");
    }
    const accessToken = signAccessToken(user._id.toString(), sessionId);
    const nextRefreshToken = signRefreshToken(user._id.toString(), sessionId);
    session.token = await hashRefreshToken(nextRefreshToken);
    session.expiresAt = getRefreshTokenExpiry();
    session.lastActiveAt = new Date();

    await user.save();

    return sendSuccess(res, {
      accessToken,
      refreshToken: nextRefreshToken,
      sessionId,
      token: accessToken,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Invalid refresh token.", 401, "INVALID_REFRESH_TOKEN");
  }
});
