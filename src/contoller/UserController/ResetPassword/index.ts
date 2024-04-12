import { RequestHandler } from "express";
import PasswordResetTokenDocument from "../../../modals/resetPassword";
import User from "../../../modals/userModal";
import crypto from "crypto";
import { PASSWORD_RESET_LINK } from "../../../utils/variables";
import { sendPasswordResetMail } from "../../../utils/mail";

export const generateResetPasswordLink: RequestHandler = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ error: "Account not found" });
  }

  const resetToken = crypto.randomBytes(36).toString("hex");

  await PasswordResetTokenDocument.create({
    owner: user._id,
    token: resetToken,
  });

  const resetLink = `${PASSWORD_RESET_LINK}?token=${resetToken}&userId=${user._id}`;

  try {
    sendPasswordResetMail({
      name: user.userName,
      email: user.email,
      link: resetLink,
    });
    res.json({ resetLink: resetLink });
  } catch (error) {
    res.json({ message: error });
  }
};
