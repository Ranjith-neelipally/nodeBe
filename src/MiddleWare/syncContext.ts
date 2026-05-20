import { RequestHandler } from "express";

export const attachSyncContext: RequestHandler = (req, _res, next) => {
  const rawHeader = req.headers["x-device-id"];
  const deviceId = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;

  req.syncContext = {
    deviceId: (deviceId || "server").toString().trim() || "server",
  };

  next();
};
