import { hash, compare } from "bcryptjs";
import { Model, Schema, model, Types } from "mongoose";

interface UserDocument {
  userName: string;
  email: string;
  password: string;
  avatar?: { url: string };
  profession?: string;
  ProjectIds: Types.ObjectId[];
  verified?: boolean;
  refreshTokens: {
    _id: Types.ObjectId;
    token: string;
    device?: string;
    deviceId?: string;
    clientType?: string;
    platform?: string;
    model?: string;
    osVersion?: string;
    browser?: string;
    lastActiveAt?: Date;
    createdAt: Date;
    expiresAt: Date;
  }[];
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
  profession: { type: String, trim: true, default: "" },
  ProjectIds: [
    {
      type: Schema.Types.ObjectId,
    },
  ],

  refreshTokens: [
    {
      token: {
        type: String,
        required: true,
      },
      device: String,
      deviceId: String,
      clientType: String,
      platform: String,
      model: String,
      osVersion: String,
      browser: String,
      lastActiveAt: { type: Date, default: Date.now },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      expiresAt: {
        type: Date,
        required: true,
      },
    },
  ],
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
