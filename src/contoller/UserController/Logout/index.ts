import { RequestHandler } from "express";
import jwt from "jsonwebtoken";

import { CreateUser } from "src/@types/user";
import User from "../../../modals/userModal";
import { TOKEN_KEY } from "../../../utils/variables";

export const Logout: RequestHandler = async (req: CreateUser, res) => {
  const { fromAll } = req.query;
  const token = req.token;
  const user = await User.findById(req.user.id);
  if (!user) throw new Error("Something went wrong, User not found");

  if (fromAll === "yes") {
    user.tokens = [];
  } else {
    user.tokens = user.tokens.filter((t) => t !== token);
  }
  await user.save();
  res.status(200).json({ messase: "done" });
};
