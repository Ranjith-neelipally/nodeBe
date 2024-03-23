import { RequestHandler } from "express";

import { CreateUser } from "src/@types/user";
import User from "../../../modals/userModal";
import { generateToken } from "../../../utils/helpers";
import { sendVerificationMail } from "../../../utils/mail";

export const CreateNewUser: RequestHandler = async (req: CreateUser, res) => {
  const { email, password, userName } = req.body;
  try {
    const user = await User.create({
      email,
      password,
      userName,
    });

    const tempToken = generateToken(6);
    sendVerificationMail(tempToken, {
      email,
      name: userName,
      userId: user._id.toString(),
    });

    res.status(201).json({ user });
  } catch (error) {
    res.json({ error: error });
  }
};
