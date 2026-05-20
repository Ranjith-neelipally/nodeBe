"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestContextMiddleware = exports.requestContext = void 0;
const async_hooks_1 = require("async_hooks");
const crypto_1 = __importDefault(require("crypto"));
exports.requestContext = new async_hooks_1.AsyncLocalStorage();
const requestContextMiddleware = (req, res, next) => {
    req.requestId = crypto_1.default.randomUUID();
    res.setHeader("x-request-id", req.requestId);
    exports.requestContext.run(req, next);
};
exports.requestContextMiddleware = requestContextMiddleware;
