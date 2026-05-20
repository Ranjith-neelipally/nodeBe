"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSyncPolicy = exports.syncPolicyRegistry = void 0;
exports.syncPolicyRegistry = {
    project: {
        preserveHistory: false,
        collapseUpdates: true,
        preserveConflicts: false,
        hardDelete: true,
    },
    plot: {
        preserveHistory: false,
        collapseUpdates: true,
        preserveConflicts: false,
        hardDelete: true,
    },
    note: {
        preserveHistory: true,
        collapseUpdates: false,
        preserveConflicts: true,
        hardDelete: true,
    },
    idea: {
        preserveHistory: true,
        collapseUpdates: false,
        preserveConflicts: true,
        hardDelete: true,
    },
};
const getSyncPolicy = (entityType) => {
    return exports.syncPolicyRegistry[entityType];
};
exports.getSyncPolicy = getSyncPolicy;
