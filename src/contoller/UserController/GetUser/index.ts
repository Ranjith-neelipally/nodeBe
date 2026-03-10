import { RequestHandler } from "express";
import User from "../../../modals/userModal";

export const GetUser: RequestHandler = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      profile: {
        id: user._id,
        name: user.userName,
        verified: user.verified,
        projects: user.ProjectIds,
        email: user.email,
        createdAt: user.createdAt || user._id.getTimestamp(),
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
