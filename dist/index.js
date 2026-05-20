"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const routers_1 = require("./routers");
const favicon_1 = require("./MiddleWare/favicon");
const home_1 = require("./templates/home");
const auth_1 = require("./MiddleWare/auth");
const requestContext_1 = require("./MiddleWare/requestContext");
const syncContext_1 = require("./MiddleWare/syncContext");
const errorHandler_1 = require("./MiddleWare/errorHandler");
const AppError_1 = require("./utils/AppError");
const db_1 = __importDefault(require("./db"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use(requestContext_1.requestContextMiddleware);
app.use(syncContext_1.attachSyncContext);
void (0, db_1.default)().catch((error) => {
    console.error("✗ Initial database connection failed:", error);
});
app.use((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, db_1.default)();
        return next();
    }
    catch (error) {
        return next(new AppError_1.AppError("Database not connected.", 503, "DATABASE_UNAVAILABLE"));
    }
}));
app.use(favicon_1.IgnoreFavIcon);
app.get("/favicon.ico", (req, res) => res.status(204).end());
app.use(express_1.default.static("src/public"));
app.use(express_1.default.static("src/public/reset-password.html"));
app.get("/", (req, res) => {
    res.send(home_1.HomeTemplate);
});
app.use("/auth", routers_1.AuthRouter);
app.use("/projects", auth_1.verifyLoginToken, routers_1.ProjectsRouter);
app.use("/ideas", auth_1.verifyLoginToken, routers_1.IdeasRouter);
app.use("/photos", auth_1.verifyLoginToken, routers_1.PhotosRouter);
app.use("/sync", auth_1.verifyLoginToken, routers_1.SyncRouter);
app.use("/admin", routers_1.RefreshModalsRouter);
app.use((req, res, next) => {
    next(new AppError_1.AppError("Route not found.", 404, "NOT_FOUND"));
});
app.use(errorHandler_1.globalErrorHandler);
(0, errorHandler_1.setupProcessErrorHandlers)();
if (process.env.NODE_ENV !== "production") {
    app.listen(1430, () => {
        console.log("listening to port 1430");
    });
}
exports.default = app;
