import express from "express";
import "dotenv/config";
import {
  AuthRouter,
  ProjectsRouter,
  IdeasRouter,
  PhotosRouter,
  SyncRouter,
  RefreshModalsRouter,
} from "./routers";
import { IgnoreFavIcon } from "./MiddleWare/favicon";
import { HomeTemplate } from "./templates/home";
import { verifyLoginToken } from "./MiddleWare/auth";
import { requestContextMiddleware } from "./MiddleWare/requestContext";
import { attachSyncContext } from "./MiddleWare/syncContext";
import { globalErrorHandler, setupProcessErrorHandlers } from "./MiddleWare/errorHandler";
import { AppError } from "./utils/AppError";
import dbConnect from "./db";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(requestContextMiddleware);
app.use(attachSyncContext);

void dbConnect().catch((error) => {
  console.error("✗ Initial database connection failed:", error);
});

// In serverless production, requests can arrive before the initial connection finishes.
// Await the cached connection promise here so cold starts don't return a false 503.
app.use(async (req, res, next) => {
  try {
    await dbConnect();
    return next();
  } catch (error) {
    return next(new AppError("Database not connected.", 503, "DATABASE_UNAVAILABLE"));
  }
});

app.use(IgnoreFavIcon);

app.get("/favicon.ico", (req, res) => res.status(204).end());

app.use(express.static("src/public"));
app.use(express.static("src/public/reset-password.html"));

app.get("/", (req, res) => {
  res.send(HomeTemplate);
});

app.use("/auth", AuthRouter);
app.use("/projects", verifyLoginToken, ProjectsRouter);
app.use("/ideas", verifyLoginToken, IdeasRouter);
app.use("/photos", verifyLoginToken, PhotosRouter);
app.use("/sync", verifyLoginToken, SyncRouter);
app.use("/admin", RefreshModalsRouter);

app.use((req, res, next) => {
  next(new AppError("Route not found.", 404, "NOT_FOUND"));
});

app.use(globalErrorHandler);

setupProcessErrorHandlers();

if (process.env.NODE_ENV !== "production") {
  app.listen(1430, () => {
    console.log("listening to port 1430");
  });
}

export default app;

