import { Schema, Types, model } from "mongoose";
import { SyncEntityType } from "../../sync/types";

interface SyncConflictDocument {
  userId: Types.ObjectId;
  entityType: SyncEntityType;
  entityId: string;
  opId: string;
  conflictGroupId: string;
  reason: string;
  localPayload?: Record<string, unknown>;
  serverSnapshot?: Record<string, unknown>;
  resolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SyncConflictSchema = new Schema<SyncConflictDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      enum: ["project", "plot", "note", "idea"],
      required: true,
    },
    entityId: {
      type: String,
      required: true,
      trim: true,
    },
    opId: {
      type: String,
      required: true,
      trim: true,
    },
    conflictGroupId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    localPayload: {
      type: Schema.Types.Mixed,
      default: null,
    },
    serverSnapshot: {
      type: Schema.Types.Mixed,
      default: null,
    },
    resolved: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
);

export const SyncConflict = model<SyncConflictDocument>(
  "SyncConflict",
  SyncConflictSchema,
);
