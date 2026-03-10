import { hash, compare } from "bcryptjs";
import { Model, ObjectId, Schema, model } from "mongoose";

interface UserDocument {
  userName: string;
  email: string;
  password: string;
  avatar?: { url: string };
  ProjectIds: ObjectId[];
  verified?: boolean;
  tokens: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface PasswordVerificationMethod {
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<UserDocument, {}, PasswordVerificationMethod>({
  userName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: Object,
    url: String,
  },
  ProjectIds: [
    {
      type: Schema.Types.ObjectId,
    },
  ],

  tokens: [String],
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = async function (password) {
  const result = await compare(password, this.password);
  return result;
};

export default model("User", userSchema) as Model<
  UserDocument,
  {},
  PasswordVerificationMethod
>;
