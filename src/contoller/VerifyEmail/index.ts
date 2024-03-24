import { RequestHandler } from "express";

import { VerifyEmail as VerifyEmailrequest } from "src/@types/user";
import emailVerificationTokenDocument from "../../modals/userVerification";
import User from "../../modals/userModal";
import { generateToken } from "../../utils/helpers";
import { sendVerificationMail } from "../../utils/mail";

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

import mongoose from "mongoose";

export const ResendVerificationEmail: RequestHandler = async (
  req: VerifyEmailrequest,
  res
) => {
  const { userId } = req.body;

  if (!mongoose.isValidObjectId(userId)) {
    return res.status(403).json({ error: "Invalid request!" });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ error: "User not found!" });
  }

  await emailVerificationTokenDocument.findOneAndDelete({
    owner: userId,
  });

  const token = generateToken(6);

  await emailVerificationTokenDocument.create({
    owner: userId,
    token,
  });

  sendVerificationMail(token, {
    name: user.userName,
    email: user.email,
    userId: user._id.toString(),
  });

  res.json({
    message: "Please check your email for verification instructions.",
  });
};
