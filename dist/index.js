"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const routers_1 = require("./routers");
const favicon_1 = require("./MiddleWare/favicon");
const home_1 = require("./templates/home");
const user_1 = require("./MiddleWare/user");
const auth_1 = require("./MiddleWare/auth");
const requestContext_1 = require("./MiddleWare/requestContext");
const errorHandler_1 = require("./MiddleWare/errorHandler");
const db_1 = __importDefault(require("./db"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
let dbConnected = false;
(0, db_1.default)()
    .then(() => {
    dbConnected = true;
})
    .catch((error) => {
    console.error("✗ Initial database connection failed:", error);
    process.exit(1);
});
app.use((req, res, next) => {
    if (!dbConnected) {
        return res.status(503).json({ error: "Database not connected" });
    }
    next();
});
app.use(requestContext_1.requestContextMiddleware);
app.use(favicon_1.IgnoreFavIcon);
app.get("/favicon.ico", (req, res) => res.status(204).end());
app.use(express_1.default.static("src/public"));
app.use(express_1.default.static("src/public/reset-password.html"));
app.get("/", (req, res) => {
    res.send(home_1.HomeTemplate);
});
app.use("/auth", routers_1.AuthRouter);
app.use("/projects", user_1.ValidateUserMiddleware, auth_1.verifyLoginToken, routers_1.ProjectsRouter);
app.use("/ideas", user_1.ValidateUserMiddleware, auth_1.verifyLoginToken, routers_1.IdeasRouter);
app.use("/photos", user_1.ValidateUserMiddleware, auth_1.verifyLoginToken, routers_1.PhotosRouter);
app.use("/admin", routers_1.RefreshModalsRouter);
app.use(errorHandler_1.globalErrorHandler);
(0, errorHandler_1.setupProcessErrorHandlers)();
if (process.env.NODE_ENV !== "production") {
    app.listen(1430, () => {
        console.log("listening to port 1430");
    });
}
exports.default = app;
