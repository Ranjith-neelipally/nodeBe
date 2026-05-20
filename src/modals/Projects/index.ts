import { model, Schema, Types } from "mongoose";
import { attachSyncMetadata } from "../../sync/metadata";

export const ProjectSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
      default: "Not Specified",
    },
    replicationsCount: {
      type: Number,
      required: true,
    },
    treatmentsCount: {
      type: Number,
      required: true,
    },
    userId: {
      ref: "User",
      type: Types.ObjectId,
      required: true,
    },
    plotsCount: {
      type: Number,
      default: 0,
    },
    notesCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

attachSyncMetadata(ProjectSchema);

export const Projects = model("Projects", ProjectSchema);
