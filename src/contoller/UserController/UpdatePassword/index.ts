import User from "../../../modals/userModal";
import { sendSuccessEmail } from "../../../utils/mail";
import { AppError } from "../../../utils/AppError";
import { asyncHandler } from "../../../utils/asyncHandler";
import { sendSuccess } from "../../../utils/apiResponse";

export const UpdatePassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const userId = req.resetUserId;

  if (!userId) {
    throw new AppError("Unauthorised Access", 403, "UNAUTHORIZED");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("Unauthorised Access", 403, "UNAUTHORIZED");
  }

  const matched = await user.comparePassword(password);

  if (matched) {
    throw new AppError("New password must be unique.", 422, "PASSWORD_REUSED");
  }

  user.password = password;
  await user.save();

  await sendSuccessEmail({
    name: user.userName,
    email: user.email
  });

  return sendSuccess(res, null, 200, "Password Updated");
});
