import { Schema, model } from "mongoose";
import { attachSyncMetadata } from "../../sync/metadata";

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
    reminderEnabled: { type: Boolean, default: false },
    reminderTime: { type: String, default: null },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", default: null },
    plotId: { type: Schema.Types.ObjectId, ref: "Plot", default: null },
    completed: { type: Boolean, default: false },
    notificationIds: { type: [Number], default: [] },
    isConflict: {
      type: Boolean,
      default: false,
      index: true,
    },
    conflictGroupId: {
      type: String,
      default: null,
      trim: true,
      index: true,
    },
    conflictReason: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { timestamps: true },
);

attachSyncMetadata(IdeasSchema);

export default model("Ideas", IdeasSchema);
