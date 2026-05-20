import User from "../../../modals/userModal";
import { AppError } from "../../../utils/AppError";
import { asyncHandler } from "../../../utils/asyncHandler";
import { findRefreshTokenIndex } from "../../../utils/authTokens";
import { sendSuccess } from "../../../utils/apiResponse";

export const Logout = asyncHandler(async (req, res) => {
  const { fromAll } = req.query;
  const { refreshToken } = req.body as { refreshToken?: string };
  const user = await User.findById(req.user.id);
  if (!user) throw new AppError("Unauthorized request.", 401, "UNAUTHORIZED");

  if (fromAll === "yes") {
    user.refreshTokens = [];
  } else if (refreshToken) {
    const tokenIndex = await findRefreshTokenIndex(user.refreshTokens || [], refreshToken);
    if (tokenIndex !== -1) {
      user.refreshTokens.splice(tokenIndex, 1);
    }
  }

  await user.save();
  return sendSuccess(res, null, 200, "Logout successful");
});
