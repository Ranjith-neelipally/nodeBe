import { Schema, Types, model } from "mongoose";
import { attachSyncMetadata } from "../../../sync/metadata";

export const PlotSchema = new Schema(
  {
    projectId: {
      type: Types.ObjectId,
      ref: "Project",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    color: {
      type: String,
      default: "#3B82F6",
    },
    replication: {
      type: Number,
      required: true,
    },
    treatment: {
      type: Number,
      required: true,
    },
    plotIndex: {
      type: [Number],
      required: true,
    },
    notesCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

attachSyncMetadata(PlotSchema);

export const Plots = model("Plots", PlotSchema);
