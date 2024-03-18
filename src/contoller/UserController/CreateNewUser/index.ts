import { RequestHandler } from "express";

import { CreateUser } from "src/@types/user";
import User from "../../../modals/userModal";

export const CreateNewUser: RequestHandler = async (req: CreateUser, res) => {
  const { email, password, userName } = req.body;

  try {
    const user = await User.create({
      email,
      password,
      userName,
    });
    res.json({ user });
  } catch (error) {
    res.json({ error: error });
  }
};
