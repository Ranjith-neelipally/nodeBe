import { Schema, Types, model } from "mongoose";

const PhotoSchema = new Schema(
  {
    photoId: { type: String, required: true, unique: true, index: true },
    pathname: { type: String, default: undefined, select: false },
    storageId: { type: String, default: undefined, select: false },
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    projectId: { type: Types.ObjectId, ref: "Projects", required: true, index: true },
    plotId: { type: Types.ObjectId, ref: "Plots", required: true, index: true },
    noteId: { type: Types.ObjectId, ref: "PlotNotes", default: null, index: true },
    variants: {
      original: {
        storageId: { type: String, required: true },
        encryption: {
          algorithm: { type: String, required: true, enum: ["AES-256-GCM"] },
          key: { type: String, required: true },
          iv: { type: String, required: true },
          authTagLength: { type: Number, required: true, default: 128 },
          mimeType: { type: String, required: true },
        },
      },
      standard: {
        storageId: { type: String, required: true },
        encryption: {
          algorithm: { type: String, required: true, enum: ["AES-256-GCM"] },
          key: { type: String, required: true },
          iv: { type: String, required: true },
          authTagLength: { type: Number, required: true, default: 128 },
          mimeType: { type: String, required: true },
        },
      },
      thumbnail: {
        storageId: { type: String, required: true },
        encryption: {
          algorithm: { type: String, required: true, enum: ["AES-256-GCM"] },
          key: { type: String, required: true },
          iv: { type: String, required: true },
          authTagLength: { type: Number, required: true, default: 128 },
          mimeType: { type: String, required: true },
        },
      },
    },
    capturedAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
);

PhotoSchema.index({ userId: 1, projectId: 1, createdAt: -1 });
export const Photos = model("Photos", PhotoSchema);
