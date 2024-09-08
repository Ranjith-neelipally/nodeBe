import { RequestHandler } from "express";

export const CreateNewProject: RequestHandler = (req, res) => {
  res.json({ message: "hello" });
};
