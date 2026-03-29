import express from "express";
import "dotenv/config";
import {
  AuthRouter,
  ProjectsRouter,
  IdeasRouter,
  PhotosRouter,
  RefreshModalsRouter,
} from "./routers";
import { IgnoreFavIcon } from "./MiddleWare/favicon";
import { HomeTemplate } from "./templates/home";
import { ValidateUserMiddleware } from "./MiddleWare/user";
import { verifyLoginToken } from "./MiddleWare/auth";
import { requestContextMiddleware } from "./MiddleWare/requestContext";
import { globalErrorHandler, setupProcessErrorHandlers } from "./MiddleWare/errorHandler";
import dbConnect from "./db";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let dbConnected = false;
dbConnect()
  .then(() => {
    dbConnected = true;
  })
  .catch((error) => {
    console.error("✗ Initial database connection failed:", error);
    process.exit(1);
  });

// Middleware to check if DB is connected
app.use((req, res, next) => {
  if (!dbConnected) {
    return res.status(503).json({ error: "Database not connected" });
  }
  next();
});

app.use(requestContextMiddleware);

app.use(IgnoreFavIcon);

app.get("/favicon.ico", (req, res) => res.status(204).end());

app.use(express.static("src/public"));
app.use(express.static("src/public/reset-password.html"));

app.get("/", (req, res) => {
  res.send(HomeTemplate);
});

app.use("/auth", AuthRouter);
app.use("/projects", ValidateUserMiddleware, verifyLoginToken, ProjectsRouter);
app.use("/ideas", ValidateUserMiddleware, verifyLoginToken, IdeasRouter);
app.use("/photos", ValidateUserMiddleware, verifyLoginToken, PhotosRouter);
app.use("/admin", RefreshModalsRouter);

app.use(globalErrorHandler);

setupProcessErrorHandlers();

if (process.env.NODE_ENV !== "production") {
  app.listen(1430, () => {
    console.log("listening to port 1430");
  });
}

export default app;
