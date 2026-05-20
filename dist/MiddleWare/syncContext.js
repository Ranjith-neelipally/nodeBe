"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachSyncContext = void 0;
const attachSyncContext = (req, _res, next) => {
    const rawHeader = req.headers["x-device-id"];
    const deviceId = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;
    req.syncContext = {
        deviceId: (deviceId || "server").toString().trim() || "server",
    };
    next();
};
exports.attachSyncContext = attachSyncContext;
