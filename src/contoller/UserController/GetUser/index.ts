import User from "../../../modals/userModal";
import { AppError } from "../../../utils/AppError";
import { asyncHandler } from "../../../utils/asyncHandler";
import { sendSuccess } from "../../../utils/apiResponse";

export const GetUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    throw new AppError("User not found.", 404, "USER_NOT_FOUND");
  }

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
  });
});
