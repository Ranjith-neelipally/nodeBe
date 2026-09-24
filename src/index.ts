import express from "express";
import "dotenv/config";
import {
  AuthRouter,
  ProjectsRouter,
  IdeasRouter,
  PhotosRouter,
  SyncRouter,
  RefreshModalsRouter,
  ObservationsRouter,
} from "./routers";
import { IgnoreFavIcon } from "./MiddleWare/favicon";
import { HomeTemplate } from "./templates/home";
import { verifyLoginToken } from "./MiddleWare/auth";
import { requestContextMiddleware } from "./MiddleWare/requestContext";
import { attachSyncContext } from "./MiddleWare/syncContext";
import {
  globalErrorHandler,
  setupProcessErrorHandlers,
} from "./MiddleWare/errorHandler";
import { AppError } from "./utils/AppError";
import dbConnect from "./db";

const app = express();
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error("BLOB_READ_WRITE_TOKEN is not configured");
}
app.set("trust proxy", 1);

const productionOrigins = ["https://research-pal.com", "https://www.research-pal.com"];
const developmentOrigins = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174"];
const defaultAllowedOrigins = [...productionOrigins, ...developmentOrigins];
const configuredOrigins = process.env.CORS_ORIGINS
  ?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = new Set(
  configuredOrigins?.length ? configuredOrigins : defaultAllowedOrigins,
);

app.disable("x-powered-by");
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.has(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Authorization,Content-Type,Accept,Cache-Control,X-Client-Type,X-Device-Id,X-Device-Model,X-Device-Platform,X-Device-Os-Version",
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
});

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: false, limit: "2mb" }));
app.use(requestContextMiddleware);
app.use(attachSyncContext);

void dbConnect().catch((error) => {
  console.error("✗ Initial database connection failed:", error);
});

app.use(async (req, res, next) => {
  try {
    await dbConnect();
    return next();
  } catch (error) {
    return next(
      new AppError("Database not connected.", 503, "DATABASE_UNAVAILABLE"),
    );
  }
});

app.use(IgnoreFavIcon);

app.get("/favicon.ico", (req, res) => res.status(204).end());

app.use(express.static("src/public"));

app.get("/", (req, res) => {
  res.send(HomeTemplate);
});

app.use("/auth", AuthRouter);
app.use("/projects", verifyLoginToken, ProjectsRouter);
app.use("/observations", verifyLoginToken, ObservationsRouter);
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
  const host = process.env.HOST || "127.0.0.1";
  const port = Number(process.env.PORT || 3000);
  app.listen(port, host, () => {
    console.log(`listening on ${host}:${port}`);
  });
}

export default app;
