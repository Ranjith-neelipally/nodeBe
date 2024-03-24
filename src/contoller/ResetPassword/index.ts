import { RequestHandler } from "express";
import PasswordResetTokenDocument from "../../modals/PasswordresetToken";
import User from "../../modals/userModal";
import crypto from "crypto";

export const generateResetPasswordLink: RequestHandler = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ error: "Account not found" });
  }

  const token = crypto.randomBytes(36).toString("hex");

  await PasswordResetTokenDocument.create({
    owner: user._id,
    token,
  });
};
