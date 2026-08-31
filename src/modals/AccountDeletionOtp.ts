import { Schema, Types, model } from "mongoose";

const AccountDeletionOtpSchema = new Schema({
  userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
  purpose: { type: String, enum: ["ACCOUNT_DELETE"], required: true },
  codeHash: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  consumedAt: { type: Date, default: null },
}, { timestamps: true });

AccountDeletionOtpSchema.index({ userId: 1, purpose: 1, createdAt: -1 });

export const AccountDeletionOtp = model("AccountDeletionOtp", AccountDeletionOtpSchema);
