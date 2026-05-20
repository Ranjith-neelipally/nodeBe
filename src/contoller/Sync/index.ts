import { RequestHandler } from "express";
import { enqueueIncomingOperations, pullUserChanges } from "../../sync/service";
import { PushSyncOperation } from "../../sync/types";

const isValidOperation = (operation: unknown): operation is PushSyncOperation => {
  if (!operation || typeof operation !== "object") {
    return false;
  }

  const entry = operation as PushSyncOperation;
  return Boolean(entry.opId && entry.entityType && entry.entityId && entry.action);
};

export const PushSyncOperations: RequestHandler = async (req, res) => {
  const userId = req.user.id.toString();
  const operations = Array.isArray(req.body?.operations) ? req.body.operations : [];
  const validOperations = operations.filter(isValidOperation);

  if (validOperations.length === 0) {
    return res.status(400).json({
      success: false,
      error: "No valid operations to push.",
    });
  }

  const results = await enqueueIncomingOperations({
    userId,
    operations: validOperations,
  });

  return res.status(200).json({
    success: true,
    data: {
      acceptedCount: results.filter((item) => item.status === "accepted").length,
      duplicateCount: results.filter((item) => item.status === "duplicate").length,
      results,
    },
  });
};

export const PullSyncChanges: RequestHandler = async (req, res) => {
  const userId = req.user.id.toString();
  const { cursor, limit } = req.query;

  const response = await pullUserChanges({
    userId,
    cursor,
    limit,
  });

  return res.status(200).json({
    success: true,
    data: response,
  });
};
