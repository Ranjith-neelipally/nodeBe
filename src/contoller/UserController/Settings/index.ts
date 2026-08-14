import User from "../../../modals/userModal";
import { AppError } from "../../../utils/AppError";
import { asyncHandler } from "../../../utils/asyncHandler";
import { sendSuccess } from "../../../utils/apiResponse";

export const UpdateProfile = asyncHandler(async (req, res) => {
  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  const profession = typeof req.body.profession === "string" ? req.body.profession.trim() : "";
  if (!name) throw new AppError("Name is required.", 400, "NAME_REQUIRED");
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { userName: name, profession },
    { new: true, runValidators: true },
  );
  if (!user) throw new AppError("User not found.", 404, "USER_NOT_FOUND");
  return sendSuccess(res, { profile: { id: user._id, name: user.userName, profession: user.profession || "", email: user.email, createdAt: user.createdAt || user._id.getTimestamp() } });
});

export const ChangePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };
  if (!currentPassword || !newPassword || newPassword.length < 8) {
    throw new AppError("Current password and a new password of at least 8 characters are required.", 400, "INVALID_PASSWORD");
  }
  const user = await User.findById(req.user.id);
  if (!user || !(await user.comparePassword(currentPassword))) {
    throw new AppError("Current password is incorrect.", 403, "INVALID_CREDENTIALS");
  }
  user.password = newPassword;
  await user.save();
  return sendSuccess(res, null, 200, "Password changed successfully");
});

export const GetSessions = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new AppError("User not found.", 404, "USER_NOT_FOUND");
  const currentSessionId = (() => {
    try { return JSON.parse(Buffer.from((req.token || "").split(".")[1], "base64url").toString()).sessionId; } catch { return undefined; }
  })();
  const now = Date.now();
  const sessions = (user.refreshTokens || [])
    .filter(session => new Date(session.expiresAt).getTime() > now)
    .map(session => {
      const current = session._id.toString() === currentSessionId;
      const platformName = session.platform === "android" ? "Android" : session.platform === "ios" ? "iOS" : session.platform;
      const title = session.clientType === "mobile"
        ? `${session.model || platformName || "Mobile device"} · ${platformName || "Mobile"}${session.osVersion ? ` ${session.osVersion}` : ""}`
        : session.device || `${session.browser || "Web browser"} · ${platformName || "Web"}`;
      const activeAt = session.lastActiveAt || session.createdAt;
      const lastActive = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(activeAt);
      return { id: session._id, title, subtitle: current ? "Current device · Active now" : `Last active ${lastActive}`, deviceId: session.deviceId, lastActiveAt: activeAt, current };
    });
  return sendSuccess(res, { sessions });
});

export const RevokeSession = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new AppError("User not found.", 404, "USER_NOT_FOUND");
  const before = user.refreshTokens.length;
  user.refreshTokens = user.refreshTokens.filter(session => session._id.toString() !== req.params.sessionId);
  if (before === user.refreshTokens.length) throw new AppError("Session not found.", 404, "SESSION_NOT_FOUND");
  await user.save();
  return sendSuccess(res, null, 200, "Session signed out");
});
