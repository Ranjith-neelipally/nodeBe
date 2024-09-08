"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IgnoreFavIcon = void 0;
const IgnoreFavIcon = (req, res, next) => {
    if (req.originalUrl.includes("favicon.ico")) {
        res.status(204).end();
    }
    next();
};
exports.IgnoreFavIcon = IgnoreFavIcon;
