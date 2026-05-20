import User from "../../../modals/userModal";
import { AppError } from "../../../utils/AppError";
import { asyncHandler } from "../../../utils/asyncHandler";
import {
  findRefreshTokenIndex,
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
    const user = await User.findById(payload.userId);

    if (!user) {
      throw new AppError("Invalid refresh token.", 401, "INVALID_REFRESH_TOKEN");
    }

    user.refreshTokens = (user.refreshTokens || []).filter(
      (stored) => new Date(stored.expiresAt).getTime() > Date.now(),
    );

    const tokenIndex = await findRefreshTokenIndex(
      user.refreshTokens,
      refreshToken,
    );

    if (tokenIndex === -1) {
      await user.save();
      throw new AppError("Invalid refresh token.", 401, "INVALID_REFRESH_TOKEN");
    }

    user.refreshTokens.splice(tokenIndex, 1);

    const accessToken = signAccessToken(user._id.toString());
    const nextRefreshToken = signRefreshToken(user._id.toString());

    user.refreshTokens.push({
      token: await hashRefreshToken(nextRefreshToken),
      device:
        typeof req.headers["user-agent"] === "string"
          ? req.headers["user-agent"]
          : undefined,
      createdAt: new Date(),
      expiresAt: getRefreshTokenExpiry(),
    });

    await user.save();

    return sendSuccess(res, {
      accessToken,
      refreshToken: nextRefreshToken,
      token: accessToken,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Invalid refresh token.", 401, "INVALID_REFRESH_TOKEN");
  }
});
