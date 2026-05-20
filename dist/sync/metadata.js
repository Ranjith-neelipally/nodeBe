"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachSyncMetadata = exports.syncMetadataFields = void 0;
const SYNC_STATUSES = ["synced", "pending", "conflict"];
exports.syncMetadataFields = {
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
const applyUpdateSyncMetadata = (query) => {
    const update = query.getUpdate();
    if (!update || Array.isArray(update)) {
        return;
    }
    const nextUpdate = Object.assign({}, update);
    const $set = (nextUpdate.$set || {});
    const $inc = (nextUpdate.$inc || {});
    const options = query.getOptions();
    $inc.serverVersion = typeof $inc.serverVersion === "number" ? $inc.serverVersion + 1 : 1;
    $set.syncedAt = new Date();
    $set.syncStatus = "synced";
    $set.lastModifiedByDeviceId = options.syncDeviceId || "server";
    nextUpdate.$set = $set;
    nextUpdate.$inc = $inc;
    query.setUpdate(nextUpdate);
};
const attachSyncMetadata = (schema) => {
    schema.add(exports.syncMetadataFields);
    schema.pre("save", function syncDocumentSave(next) {
        const doc = this;
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
        applyUpdateSyncMetadata(this);
        next();
    });
    schema.pre("updateMany", function syncUpdateMany(next) {
        applyUpdateSyncMetadata(this);
        next();
    });
    schema.pre("findOneAndUpdate", function syncFindOneAndUpdate(next) {
        applyUpdateSyncMetadata(this);
        next();
    });
};
exports.attachSyncMetadata = attachSyncMetadata;
