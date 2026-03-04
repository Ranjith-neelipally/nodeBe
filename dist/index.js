"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
require("./db");
const routers_1 = require("./routers");
const favicon_1 = require("./MiddleWare/favicon");
const home_1 = require("./templates/home");
const user_1 = require("./MiddleWare/user");
const auth_1 = require("./MiddleWare/auth");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
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
app.listen(1430, () => {
    console.log("listening to port and");
});
