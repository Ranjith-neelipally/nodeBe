import { RequestHandler } from "express";
import PasswordResetTokenDocument from "../../../modals/resetPassword";

export const verifyResetPasswordToken: RequestHandler = async (req, res) => {
  const { token, userId } = req.body;

  const resetToken = await PasswordResetTokenDocument.findOne({
    owner: userId,
  });

  if (!resetToken) {
    return res
      .status(403)
      .json({ error: "Invalid reset token for the given user" });
  }

  const tokenMatched = await resetToken.compareToken(token);

  if (!tokenMatched) {
    return res.status(403).json({ error: "Token verification failed" });
  }

  res.status(200).json({ message: "Token is valid" });
};

export const grantValid: RequestHandler = async (req, res) => {
  res.json({ valid: true });
};
