export type SyncEntityType = "project" | "plot" | "note" | "idea";

export type SyncAction = "create" | "update" | "delete";

export type SyncStatus = "synced" | "pending" | "conflict";

export interface SyncPolicy {
  preserveHistory: boolean;
  collapseUpdates: boolean;
  preserveConflicts: boolean;
  hardDelete: boolean;
}

export interface PushSyncOperation {
  opId: string;
  entityType: SyncEntityType;
  entityId: string;
  action: SyncAction;
  payload?: Record<string, unknown>;
  baseServerVersion?: number;
  createdAt?: string;
}

export interface SyncHeaderContext {
  deviceId: string;
}
