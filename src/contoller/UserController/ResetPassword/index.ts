import User from "../../../modals/userModal";
import { PASSWORD_RESET_LINK } from "../../../utils/variables";
import { sendPasswordResetMail } from "../../../utils/mail";
import { signPasswordResetToken } from "../../../utils/authTokens";
import { asyncHandler } from "../../../utils/asyncHandler";
import { sendSuccess } from "../../../utils/apiResponse";

const resetMessage = "If the account exists, password reset instructions have been sent.";

export const GenerateResetPasswordLink = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return sendSuccess(res, null, 200, resetMessage);
  }

  const resetToken = signPasswordResetToken(user._id.toString());
  const resetLink = `${PASSWORD_RESET_LINK}?token=${resetToken}&userId=${user._id}`;

  await sendPasswordResetMail({
    name: user.userName,
    email: user.email,
    link: resetLink,
  });

  return sendSuccess(res, null, 200, resetMessage);
});
