import { Schema, Types, model } from "mongoose";
import { attachSyncMetadata } from "../../../sync/metadata";

const PlotNoteItemSchema = new Schema(
  {
    note: {
      type: [String],
      default: [],
    },
    photoIds: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true, _id: true },
);

export const PlotNotesSchema = new Schema(
  {
    projectId: {
      type: Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    plotId: {
      type: Types.ObjectId,
      ref: "Plot",
      required: true,
      index: true,
    },

    title: String,

    content: {
      type: [PlotNoteItemSchema],
      default: [],
    },

    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    ProjectTitle: String,
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

attachSyncMetadata(PlotNotesSchema);

export const PlotNotes = model("PlotNotes", PlotNotesSchema);
