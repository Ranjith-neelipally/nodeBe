"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestContextMiddleware = exports.requestContext = void 0;
const async_hooks_1 = require("async_hooks");
exports.requestContext = new async_hooks_1.AsyncLocalStorage();
const requestContextMiddleware = (req, res, next) => {
    exports.requestContext.run(req, next);
};
exports.requestContextMiddleware = requestContextMiddleware;
