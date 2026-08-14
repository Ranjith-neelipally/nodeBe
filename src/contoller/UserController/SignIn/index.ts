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

  user.refreshTokens = (user.refreshTokens || []).filter(
    (stored) => new Date(stored.expiresAt).getTime() > Date.now(),
  );
  const deviceId = typeof req.headers["x-device-id"] === "string"
    ? req.headers["x-device-id"]
    : undefined;
  if (deviceId) {
    // A device owns one renewable session. Re-login replaces its stale record
    // instead of growing refreshTokens on every app reinstall/login attempt.
    user.refreshTokens = user.refreshTokens.filter(
      (stored) => stored.deviceId !== deviceId,
    );
  }
  const userAgent = typeof req.headers["user-agent"] === "string" ? req.headers["user-agent"] : "";
  const mobileMetadata = req.headers["x-client-type"] === "mobile";
  const browser = /Edg\//.test(userAgent) ? "Edge" : /Chrome\//.test(userAgent) ? "Chrome" : /Safari\//.test(userAgent) ? "Safari" : /Firefox\//.test(userAgent) ? "Firefox" : "Web browser";
  const webPlatform = /Windows/.test(userAgent) ? "Windows" : /Android/.test(userAgent) ? "Android" : /Mac OS X/.test(userAgent) ? "macOS" : /iPhone|iPad/.test(userAgent) ? "iOS" : /Linux/.test(userAgent) ? "Linux" : "Web";
  user.refreshTokens.push({
    token: "pending",
    device: mobileMetadata ? undefined : `${browser} · ${webPlatform}`,
    deviceId,
    clientType: mobileMetadata ? "mobile" : "web",
    platform: mobileMetadata && typeof req.headers["x-device-platform"] === "string" ? req.headers["x-device-platform"] : webPlatform,
    model: mobileMetadata && typeof req.headers["x-device-model"] === "string" ? req.headers["x-device-model"] : undefined,
    osVersion: mobileMetadata && typeof req.headers["x-device-os-version"] === "string" ? req.headers["x-device-os-version"] : undefined,
    browser: mobileMetadata ? undefined : browser,
    createdAt: new Date(),
    lastActiveAt: new Date(),
    expiresAt: getRefreshTokenExpiry(),
  } as any);
  const session = user.refreshTokens[user.refreshTokens.length - 1];
  const sessionId = session._id.toString();
  const accessToken = signAccessToken(user._id.toString(), sessionId);
  const refreshToken = signRefreshToken(user._id.toString(), sessionId);
  session.token = await hashRefreshToken(refreshToken);
  await user.save();

  return sendSuccess(res, {
    profile: {
      id: user._id,
      name: user.userName,
      verified: user.verified,
      projects: user.ProjectIds,
      email: user.email,
      createdAt: user.createdAt || user._id.getTimestamp(),
      profession: user.profession || "",
    },
    accessToken,
    refreshToken,
    sessionId,
    token: accessToken,
  });
});
