import { createHash, randomInt, timingSafeEqual } from "crypto";
import { RequestHandler } from "express";
import User from "../../../modals/userModal";
import { AccountDeletionOtp } from "../../../modals/AccountDeletionOtp";
import { deleteUserAccount } from "../../../services/deleteUserAccount";
import { sendAccountDeletionCode } from "../../../utils/mail";
import { AppError } from "../../../utils/AppError";
import { sendSuccess } from "../../../utils/apiResponse";

const PURPOSE = "ACCOUNT_DELETE" as const;
const hashCode = (userId: string, code: string) =>
  createHash("sha256").update(`${userId}:${PURPOSE}:${code}`).digest("hex");

export const RequestAccountDeletion: RequestHandler = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("email userName");
    if (!user) throw new AppError("Unauthorized request.", 401, "UNAUTHORIZED");
    const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
    await AccountDeletionOtp.updateMany(
      { userId: user._id, purpose: PURPOSE, consumedAt: null },
      { $set: { consumedAt: new Date() } },
    );
    const otp = await AccountDeletionOtp.create({
      userId: user._id,
      purpose: PURPOSE,
      codeHash: hashCode(String(user._id), code),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    try {
      await sendAccountDeletionCode(code, { name: user.userName, email: user.email });
    } catch (error) {
      await otp.deleteOne();
      throw error;
    }
    return sendSuccess(res, null, 200, "Verification code sent");
  } catch (error) { return next(error); }
};

export const ConfirmAccountDeletion: RequestHandler = async (req, res, next) => {
  try {
    const code = typeof req.body?.otp === "string" ? req.body.otp.trim() : "";
    if (!/^\d{6}$/.test(code)) throw new AppError("The verification code is incorrect.", 400, "INVALID_DELETE_OTP");
    const otp = await AccountDeletionOtp.findOne({
      userId: req.user.id, purpose: PURPOSE, consumedAt: null,
    }).sort({ createdAt: -1 });
    if (!otp) throw new AppError("The verification code is incorrect.", 400, "INVALID_DELETE_OTP");
    if (otp.expiresAt.getTime() <= Date.now()) {
      throw new AppError("This verification code has expired. Request a new code.", 400, "EXPIRED_DELETE_OTP");
    }
    const expected = Buffer.from(otp.codeHash, "hex");
    const actual = Buffer.from(hashCode(String(req.user.id), code), "hex");
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
      throw new AppError("The verification code is incorrect.", 400, "INVALID_DELETE_OTP");
    }
    await deleteUserAccount(String(req.user.id), String(otp._id));
    return sendSuccess(res, null, 200, "Account deleted");
  } catch (error) { return next(error); }
};
