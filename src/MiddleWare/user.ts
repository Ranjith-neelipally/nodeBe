import { Request } from "express";
import User from "../modals/userModal";
interface User extends Request {
  body: {
    userId: string;
  };
}

export const ValidateUserMiddleware = async (
  req: any,
  res: any,
  next: Function
) => {
  const userId = req.body?.userId || req.query?.userId || req.params?.userId;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found, Unauthorized" });
    }

    // attach user for later use (optional but recommended)
    req.user = user;

    next();
  } catch (error) {
    console.error("User validation error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
