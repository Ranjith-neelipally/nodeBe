import { RequestHandler } from "express";
import jwt from "jsonwebtoken";

import { CreateUser } from "src/@types/user";
import User from "../../../modals/userModal";
import { TOKEN_KEY } from "../../../utils/variables";

export const SignIn: RequestHandler = async (req: CreateUser, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(403).json({ error: "User/Password mismatch" });
    } else {
      const matched = await user.comparePassword(password);
      if (!matched) {
        res.status(403).json({ error: "User/Password mismatch" });
      } else {
        const jwdToken = jwt.sign({ userId: user._id }, TOKEN_KEY);
        user.tokens.push(jwdToken);
        await user.save();
        res.json({
          profile: {
            id: user._id,
            name: user.userName,
            verified: user.verified,
            projects: user.ProjectIds,
          },
          token: jwdToken,
        });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error });
  }
};
