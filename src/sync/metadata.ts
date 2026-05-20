import { Query, Schema } from "mongoose";
import { SyncStatus } from "./types";

const SYNC_STATUSES: SyncStatus[] = ["synced", "pending", "conflict"];

export const syncMetadataFields = {
  serverVersion: {
    type: Number,
    default: 1,
    min: 1,
  },
  lastModifiedByDeviceId: {
    type: String,
    default: "server",
    trim: true,
  },
  syncedAt: {
    type: Date,
    default: Date.now,
  },
  createdOfflineAt: {
    type: Date,
    default: null,
  },
  syncStatus: {
    type: String,
    enum: SYNC_STATUSES,
    default: "synced",
  },
};

const applyUpdateSyncMetadata = (query: Query<unknown, unknown>) => {
  const update = query.getUpdate();

  if (!update || Array.isArray(update)) {
    return;
  }

  const nextUpdate = { ...update } as Record<string, unknown>;
  const $set = ((nextUpdate.$set as Record<string, unknown>) || {});
  const $inc = ((nextUpdate.$inc as Record<string, number>) || {});
  const options = query.getOptions() as { syncDeviceId?: string };

  $inc.serverVersion = typeof $inc.serverVersion === "number" ? $inc.serverVersion + 1 : 1;
  $set.syncedAt = new Date();
  $set.syncStatus = "synced";
  $set.lastModifiedByDeviceId = options.syncDeviceId || "server";

  nextUpdate.$set = $set;
  nextUpdate.$inc = $inc;
  query.setUpdate(nextUpdate);
};

export const attachSyncMetadata = (schema: Schema) => {
  schema.add(syncMetadataFields);

  schema.pre("save", function syncDocumentSave(next) {
    const doc = this as unknown as {
      isNew: boolean;
      serverVersion?: number;
      lastModifiedByDeviceId?: string;
      syncedAt?: Date;
      syncStatus?: SyncStatus;
    };

    if (doc.isNew && (!doc.serverVersion || doc.serverVersion < 1)) {
      doc.serverVersion = 1;
    }

    if (!doc.lastModifiedByDeviceId) {
      doc.lastModifiedByDeviceId = "server";
    }

    doc.syncedAt = new Date();
    doc.syncStatus = doc.syncStatus || "synced";
    next();
  });

  schema.pre("updateOne", function syncUpdateOne(next) {
    applyUpdateSyncMetadata(this as unknown as Query<unknown, unknown>);
    next();
  });

  schema.pre("updateMany", function syncUpdateMany(next) {
    applyUpdateSyncMetadata(this as unknown as Query<unknown, unknown>);
    next();
  });

  schema.pre("findOneAndUpdate", function syncFindOneAndUpdate(next) {
    applyUpdateSyncMetadata(this as unknown as Query<unknown, unknown>);
    next();
  });
};
