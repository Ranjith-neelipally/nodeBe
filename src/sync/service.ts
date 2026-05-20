import { randomUUID } from "crypto";
import { OperationReceipt } from "../modals/Sync/OperationReceipt";
import { SyncChange } from "../modals/Sync/SyncChange";
import { SyncConflict } from "../modals/Sync/SyncConflict";
import { getSyncPolicy } from "./policies";
import { PushSyncOperation, SyncEntityType } from "./types";

const toSafePositiveInteger = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.floor(parsed);
};

export const enqueueIncomingOperations = async (params: {
  userId: string;
  operations: PushSyncOperation[];
}) => {
  const { userId, operations } = params;
  const results: Array<Record<string, unknown>> = [];

  for (const op of operations) {
    const existingReceipt = await OperationReceipt.findOne({ userId, opId: op.opId });

    if (existingReceipt) {
      results.push({
        opId: op.opId,
        entityType: op.entityType,
        entityId: op.entityId,
        status: "duplicate",
        responseCode: existingReceipt.responseCode,
      });
      continue;
    }

    const policy = getSyncPolicy(op.entityType);
    await OperationReceipt.create({
      userId,
      opId: op.opId,
      entityType: op.entityType,
      entityId: op.entityId,
      action: op.action,
      status: "accepted",
      responseCode: "QUEUED_FOR_PROCESSING",
    });

    results.push({
      opId: op.opId,
      entityType: op.entityType,
      entityId: op.entityId,
      status: "accepted",
      policy,
    });
  }

  return results;
};

export const pullUserChanges = async (params: {
  userId: string;
  cursor?: unknown;
  limit?: unknown;
}) => {
  const { userId, cursor, limit } = params;
  const parsedCursor = toSafePositiveInteger(cursor, 0);
  const parsedLimit = Math.min(toSafePositiveInteger(limit, 50), 100);

  const changes = await SyncChange.find({
    userId,
    cursor: { $gt: parsedCursor },
  })
    .sort({ cursor: 1 })
    .limit(parsedLimit)
    .lean();

  const nextCursor = changes.length > 0 ? changes[changes.length - 1].cursor : parsedCursor;
  return {
    nextCursor,
    changes,
  };
};

export const recordSyncConflict = async (params: {
  userId: string;
  entityType: SyncEntityType;
  entityId: string;
  opId: string;
  reason: string;
  localPayload?: Record<string, unknown>;
  serverSnapshot?: Record<string, unknown>;
}) => {
  const conflictGroupId = randomUUID();

  const conflict = await SyncConflict.create({
    userId: params.userId,
    entityType: params.entityType,
    entityId: params.entityId,
    opId: params.opId,
    conflictGroupId,
    reason: params.reason,
    localPayload: params.localPayload || null,
    serverSnapshot: params.serverSnapshot || null,
  });

  return conflict;
};
