"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Sync_1 = require("../../contoller/Sync");
const SyncRouter = (0, express_1.Router)();
SyncRouter.post("/push", Sync_1.PushSyncOperations);
SyncRouter.get("/pull", Sync_1.PullSyncChanges);
exports.default = SyncRouter;
