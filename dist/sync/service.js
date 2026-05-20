"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordSyncConflict = exports.pullUserChanges = exports.enqueueIncomingOperations = void 0;
const crypto_1 = require("crypto");
const OperationReceipt_1 = require("../modals/Sync/OperationReceipt");
const SyncChange_1 = require("../modals/Sync/SyncChange");
const SyncConflict_1 = require("../modals/Sync/SyncConflict");
const policies_1 = require("./policies");
const toSafePositiveInteger = (value, fallback) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 1) {
        return fallback;
    }
    return Math.floor(parsed);
};
const enqueueIncomingOperations = (params) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, operations } = params;
    const results = [];
    for (const op of operations) {
        const existingReceipt = yield OperationReceipt_1.OperationReceipt.findOne({ userId, opId: op.opId });
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
        const policy = (0, policies_1.getSyncPolicy)(op.entityType);
        yield OperationReceipt_1.OperationReceipt.create({
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
});
exports.enqueueIncomingOperations = enqueueIncomingOperations;
const pullUserChanges = (params) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, cursor, limit } = params;
    const parsedCursor = toSafePositiveInteger(cursor, 0);
    const parsedLimit = Math.min(toSafePositiveInteger(limit, 50), 100);
    const changes = yield SyncChange_1.SyncChange.find({
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
});
exports.pullUserChanges = pullUserChanges;
const recordSyncConflict = (params) => __awaiter(void 0, void 0, void 0, function* () {
    const conflictGroupId = (0, crypto_1.randomUUID)();
    const conflict = yield SyncConflict_1.SyncConflict.create({
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
});
exports.recordSyncConflict = recordSyncConflict;
