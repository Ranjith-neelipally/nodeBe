import { Router } from "express";
import { PullSyncChanges, PushSyncOperations } from "../../contoller/Sync";

const SyncRouter = Router();

SyncRouter.post("/push", PushSyncOperations);
SyncRouter.get("/pull", PullSyncChanges);

export default SyncRouter;
