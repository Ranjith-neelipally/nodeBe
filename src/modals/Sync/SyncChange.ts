import { Schema, Types, model } from "mongoose";
import { SyncAction, SyncEntityType } from "../../sync/types";

interface SyncChangeDocument {
  userId: Types.ObjectId;
  cursor: number;
  entityType: SyncEntityType;
  entityId: string;
  action: SyncAction;
  serverVersion: number;
  payload?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const SyncChangeSchema = new Schema<SyncChangeDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    cursor: {
      type: Number,
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
    action: {
      type: String,
      enum: ["create", "update", "delete"],
      required: true,
    },
    serverVersion: {
      type: Number,
      required: true,
      min: 1,
    },
    payload: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true },
);

SyncChangeSchema.index({ userId: 1, cursor: 1 });

export const SyncChange = model<SyncChangeDocument>("SyncChange", SyncChangeSchema);
