import { CreateUser } from "src/@types/user";
import User from "../../../modals/userModal";
import { AppError } from "../../../utils/AppError";
import { asyncHandler } from "../../../utils/asyncHandler";
import {
  getRefreshTokenExpiry,
  hashRefreshToken,
  signAccessToken,
  signRefreshToken,
} from "../../../utils/authTokens";
import { sendSuccess } from "../../../utils/apiResponse";

export const SignIn = asyncHandler(async (req: CreateUser, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("User/Password mismatch", 403, "INVALID_CREDENTIALS");
  }

  const matched = await user.comparePassword(password);
  if (!matched) {
    throw new AppError("User/Password mismatch", 403, "INVALID_CREDENTIALS");
  }

  if (!user.verified) {
    throw new AppError(
      "Please verify your email before signing in. Check your email for verification instructions.",
      403,
      "PROFILE_NOT_VERIFIED",
      { verified: false },
    );
  }

  const accessToken = signAccessToken(user._id.toString());
  const refreshToken = signRefreshToken(user._id.toString());
  user.refreshTokens = (user.refreshTokens || []).filter(
    (stored) => new Date(stored.expiresAt).getTime() > Date.now(),
  );
  user.refreshTokens.push({
    token: await hashRefreshToken(refreshToken),
    device:
      typeof req.headers["user-agent"] === "string"
        ? req.headers["user-agent"]
        : undefined,
    createdAt: new Date(),
    expiresAt: getRefreshTokenExpiry(),
  });
  await user.save();

  return sendSuccess(res, {
    profile: {
      id: user._id,
      name: user.userName,
      verified: user.verified,
      projects: user.ProjectIds,
      email: user.email,
      createdAt: user.createdAt || user._id.getTimestamp(),
    },
    accessToken,
    refreshToken,
    token: accessToken,
  });
});
