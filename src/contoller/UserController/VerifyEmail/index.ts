import { VerifyEmail as VerifyEmailrequest } from "src/@types/user";
import User from "../../../modals/userModal";
import { generateToken } from "../../../utils/helpers";
import { sendVerificationMail } from "../../../utils/mail";
import {
  compareEmailCode,
  hashEmailCode,
  signEmailVerificationToken,
  verifyAuthToken,
} from "../../../utils/authTokens";
import mongoose from "mongoose";
import { AppError } from "../../../utils/AppError";
import { asyncHandler } from "../../../utils/asyncHandler";
import { sendSuccess } from "../../../utils/apiResponse";

export const VerifyEmail = asyncHandler(async (
  req: VerifyEmailrequest,
  res
) => {
  const { userId, code, verificationToken } = req.body;

  if (typeof code !== "string" || code.trim() === "") {
    throw new AppError("Verification code is required.", 403, "INVALID_VERIFICATION_CODE");
  }

  if (!verificationToken) {
    throw new AppError("Invalid token", 403, "INVALID_VERIFICATION_TOKEN");
  }

  const payload = verifyAuthToken(verificationToken, "email-verification");

  if (userId && payload.userId !== userId) {
    throw new AppError("Invalid token", 403, "INVALID_VERIFICATION_TOKEN");
  }

  if (!payload.codeHash) {
    throw new AppError("Invalid token", 403, "INVALID_VERIFICATION_TOKEN");
  }

  const matched = await compareEmailCode(code.trim(), payload.codeHash);

  if (!matched) {
    throw new AppError("Invalid token", 403, "INVALID_VERIFICATION_TOKEN");
  }

  await User.findByIdAndUpdate(payload.userId, {
    verified: true,
  });

  return sendSuccess(res, null, 200, "Email is verified");
});

export const ResendVerificationEmail = asyncHandler(async (
  req: VerifyEmailrequest,
  res
) => {
  const { userId } = req.body;

  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError("Invalid request.", 403, "INVALID_REQUEST");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found.", 404, "USER_NOT_FOUND");
  }

  const token = generateToken(6);
  const verificationToken = signEmailVerificationToken(
    user._id.toString(),
    await hashEmailCode(token),
  );

  await sendVerificationMail(token, {
    name: user.userName,
    email: user.email,
    userId: user._id.toString(),
  });

  return sendSuccess(res, {
    verificationToken,
  }, 200, "Please check your email for verification instructions.");
});
