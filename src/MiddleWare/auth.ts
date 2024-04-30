import { RequestHandler, response } from "express";
import PasswordResetTokenDocument from "../modals/resetPassword";
import User from "../modals/userModal";
import { TOKEN_KEY } from "../utils/variables";
import { JwtPayload, verify } from "jsonwebtoken";

export const verifyResetPasswordToken: RequestHandler = async (
  req,
  res,
  next
) => {
  const { token, userId } = req.body;

  const resetToken = await PasswordResetTokenDocument.findOne({
    owner: userId,
  });

  if (!resetToken) {
    return res
      .status(403)
      .json({ error: "Invalid reset token for the given user" });
  }

  const tokenMatched = await resetToken.compareToken(token);

  if (!tokenMatched) {
    return res.status(403).json({ error: "Token verification failed" });
  }
  next();

  res.status(200).json({ message: "Token is valid" });
};

export const verifyLoginToken: RequestHandler = async (req, res, next) => {
  const { authorization } = req.headers;
  const splitToken = authorization?.split("Bearer ")[1]?.trim();

  if (!splitToken) {
    return res.status(403).json({ error: "Unauthorized Request!" });
  }

  try {
    const details = verify(splitToken, TOKEN_KEY) as JwtPayload;
    const id = details.userId;

    if (!id) {
      return res.status(403).json({ error: "Unauthorized Request!" });
    }

    const user = await User.findOne({ _id: id, tokens: splitToken });

    if (!user) {
      return res.status(404).json({ response: "Unauthorized Request!" });
    }

    req.user = {
      id: user._id,
      name: user.userName,
      verified: user.verified as boolean,
      projects: user.ProjectIds.map((id) => id.toString()),
    };
    req.token = splitToken
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return res.status(403).json({ error: "Unauthorized Request!" });
  }
};
