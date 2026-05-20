import { Schema, Types, model } from "mongoose";
import { SyncAction, SyncEntityType } from "../../sync/types";

interface OperationReceiptDocument {
  userId: Types.ObjectId;
  opId: string;
  entityType: SyncEntityType;
  entityId: string;
  action: SyncAction;
  status: "accepted" | "duplicate" | "failed";
  responseCode: string;
  createdAt: Date;
  updatedAt: Date;
}

const OperationReceiptSchema = new Schema<OperationReceiptDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    opId: {
      type: String,
      required: true,
      trim: true,
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
    status: {
      type: String,
      enum: ["accepted", "duplicate", "failed"],
      default: "accepted",
    },
    responseCode: {
      type: String,
      required: true,
      default: "ACKNOWLEDGED",
    },
  },
  { timestamps: true },
);

OperationReceiptSchema.index({ userId: 1, opId: 1 }, { unique: true });

export const OperationReceipt = model<OperationReceiptDocument>(
  "OperationReceipt",
  OperationReceiptSchema,
);
