import { RequestHandler } from "express";

export const IgnoreFavIcon: RequestHandler = (req, res, next) => {
  if (req.originalUrl.includes("favicon.ico")) {
    res.status(204).end();
  }
  next();
};
