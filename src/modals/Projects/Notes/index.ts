import { Schema, Types, model } from "mongoose";

const PlotNoteItemSchema = new Schema(
  {
    note: {
      type: String,
      required: true,
      trim: true,
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
  },
  { timestamps: true },
);

export const PlotNotes = model("PlotNotes", PlotNotesSchema);
