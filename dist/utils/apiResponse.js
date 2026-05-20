"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, data, statusCode = 200, message) => res.status(statusCode).json(Object.assign(Object.assign({ success: true, data }, (message ? { message } : {})), { requestId: res.req.requestId }));
exports.sendSuccess = sendSuccess;
const sendError = (res, statusCode, code, message, details) => res.status(statusCode).json({
    success: false,
    error: Object.assign({ code,
        message }, (typeof details !== "undefined" ? { details } : {})),
    requestId: res.req.requestId,
});
exports.sendError = sendError;
