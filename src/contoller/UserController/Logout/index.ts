import User from "../../../modals/userModal";
import { AppError } from "../../../utils/AppError";
import { asyncHandler } from "../../../utils/asyncHandler";
import { verifyAuthToken } from "../../../utils/authTokens";
import { sendSuccess } from "../../../utils/apiResponse";

export const Logout = asyncHandler(async (req, res) => {
  const { fromAll } = req.query;
  const user = await User.findById(req.user.id);
  if (!user) throw new AppError("Unauthorized request.", 401, "UNAUTHORIZED");

  if (fromAll === "yes") {
    user.refreshTokens = [];
  } else {
    const sessionId = req.token
      ? verifyAuthToken(req.token, "access").sessionId
      : undefined;
    if (!sessionId) {
      throw new AppError("Invalid session.", 401, "INVALID_SESSION");
    }
    user.refreshTokens = (user.refreshTokens || []).filter(
      (session) => session._id.toString() !== sessionId,
    );
  }

  await user.save();
  return sendSuccess(res, null, 200, "Logout successful");
});
