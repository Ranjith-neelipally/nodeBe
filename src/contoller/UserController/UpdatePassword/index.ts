import { RequestHandler } from "express";
import PasswordResetTokenDocument from "../../../modals/resetPassword";
import User from "../../../modals/userModal";
import { sendSuccessEmail } from "../../../utils/mail";

export const UpdatePassword: RequestHandler = async (req, res) => {
  const { password, userId } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(403).json({ error: "Unauthorised Access" });
  }

  const matched = await user.comparePassword(password);

  if (matched) {
    res.status(422).json({ error: "new Passsword must be Unique!" });
  }

  user.password = password;
  await user.save();

  await PasswordResetTokenDocument.findOneAndDelete({ owner: user._id });
  sendSuccessEmail({
    name: user.userName,
    email: user.email
  });

  res.status(200).json({ message: "Password Updated" });
};
