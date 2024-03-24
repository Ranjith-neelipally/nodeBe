import { Model, ObjectId, Schema, model } from "mongoose";
import { hash, compare } from "bcrypt";

interface passwordresetTokenDocument {
  owner: ObjectId;
  token: string;
  createdAt: Date;
}

interface PasswordVerificationMethod {
  compareToken(token: string): Promise<boolean>;
}

const passwordResetTokenSchema = new Schema<
  passwordresetTokenDocument,
  {},
  PasswordVerificationMethod
>({
  owner: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    expires: 3600,
    default: Date.now(),
  },
});

passwordResetTokenSchema.pre("save", async function (next) {
  if (this.isModified("token")) {
    this.token = await hash(this.token, 10);
  }
  next();
});

passwordResetTokenSchema.methods.compareToken = async function (token) {
  const result = await compare(token, this.token);
  return result;
};

export default model(
  "PasswordResetTokenDocument",
  passwordResetTokenSchema
) as Model<passwordresetTokenDocument, {}, PasswordVerificationMethod>;
