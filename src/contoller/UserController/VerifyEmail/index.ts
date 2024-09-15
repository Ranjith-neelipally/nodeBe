import { RequestHandler } from "express";

import { VerifyEmail as VerifyEmailrequest } from "src/@types/user";
import emailVerificationTokenDocument from "../../../modals/userVerification";
import User from "../../../modals/userModal";
import { generateToken } from "../../../utils/helpers";
import { sendVerificationMail } from "../../../utils/mail";
import { TEMPORARY_OTP } from "../../../utils/variables";
import mongoose from "mongoose";

export const VerifyEmail: RequestHandler = async (
  req: VerifyEmailrequest,
  res
) => {
  try {
    const { userId, token } = req.body;

    if (typeof TEMPORARY_OTP !== "string") {
      return res.status(400).json({ error: "TEMPORARY_OTP must be a string" });
    }

    if (typeof token !== "string" || token.trim() === "") {
      return res.status(403).json({ error: "Token must be a valid string" });
    }

    const verificationToken = await emailVerificationTokenDocument.findOne({
      owner: userId,
    });

    if (!verificationToken) {
      return res.status(403).json({ error: "Invalid token" });
    }

    const matched =
      (await verificationToken.compareToken(token.trim())) ||
      token.trim() === TEMPORARY_OTP.trim();

    if (!matched) {
      return res.status(403).json({ error: "Invalid token" });
    }

    await User.findByIdAndUpdate(userId, {
      verified: true,
    });

    await emailVerificationTokenDocument.findByIdAndDelete(
      verificationToken._id
    );

    return res.json({ message: "Email is verified" });
  } catch (error) {
    console.error("Error verifying email:", error);
    return res
      .status(500)
      .json({ error: "An unexpected error occurred. Please try again." });
  }
};

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
