import { RequestHandler } from "express";

import { VerifyEmail as VerifyEmailrequest } from "src/@types/user";
import emailVerificationTokenDocument from "../../modals/userVerification";
import User from "../../modals/userModal";

export const VerifyEmail: RequestHandler = async (
  req: VerifyEmailrequest,
  res
) => {
  const { userId, token } = req.body;

  const verificationToken = await emailVerificationTokenDocument.findOne({
    owner: userId,
  });

  if (!verificationToken) {
    return res.status(403).json({ error: "Inavid Token" });
  }

  const matched = await verificationToken.compareToken(token);

  if (!matched) {
    return res.status(403).json({ error: "Inavid Token" });
  }

  await User.findByIdAndUpdate(userId, {
    verified: true,
  });

  await emailVerificationTokenDocument.findByIdAndDelete(verificationToken._id);
  res.json({ message: "Email is Verified" });
};
