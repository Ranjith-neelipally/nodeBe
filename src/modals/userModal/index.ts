import { Model, ObjectId, Schema, model } from "mongoose";

interface UserDocument {
  userName: string;
  email: string;
  password: string;
  avatar?: { url: string };
  ProjectIds: ObjectId[];
}

const userSchema = new Schema<UserDocument>({
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
});

export default model("User", userSchema) as Model<UserDocument>;
