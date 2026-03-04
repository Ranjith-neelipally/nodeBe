import { Schema, model } from "mongoose";

const IdeasSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    idea: {
      type: String,
      require: true,
    },
    date: {
      type: String,
      require: true,
    },
  },
  { timestamps: true },
);

export default model("Ideas", IdeasSchema);
