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
exports.PullSyncChanges = exports.PushSyncOperations = void 0;
const service_1 = require("../../sync/service");
const isValidOperation = (operation) => {
    if (!operation || typeof operation !== "object") {
        return false;
    }
    const entry = operation;
    return Boolean(entry.opId && entry.entityType && entry.entityId && entry.action);
};
const PushSyncOperations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = req.user.id.toString();
    const operations = Array.isArray((_a = req.body) === null || _a === void 0 ? void 0 : _a.operations) ? req.body.operations : [];
    const validOperations = operations.filter(isValidOperation);
    if (validOperations.length === 0) {
        return res.status(400).json({
            success: false,
            error: "No valid operations to push.",
        });
    }
    const results = yield (0, service_1.enqueueIncomingOperations)({
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
});
exports.PushSyncOperations = PushSyncOperations;
const PullSyncChanges = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id.toString();
    const { cursor, limit } = req.query;
    const response = yield (0, service_1.pullUserChanges)({
        userId,
        cursor,
        limit,
    });
    return res.status(200).json({
        success: true,
        data: response,
    });
});
exports.PullSyncChanges = PullSyncChanges;
