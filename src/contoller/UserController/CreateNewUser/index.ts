import { RequestHandler } from "express";
import nodemailer from "nodemailer";

import { CreateUser } from "src/@types/user";
import User from "../../../modals/userModal";
import { MAILTRAP_PASSWORD, MAILTRAP_USER } from "../../../utils/variables";

export const CreateNewUser: RequestHandler = async (req: CreateUser, res) => {
  const { email, password, userName } = req.body;

  const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: MAILTRAP_USER,
      pass: MAILTRAP_PASSWORD,
    },
  });

  try {
    const user = await User.create({
      email,
      password,
      userName,
    });
    try {
      transport.sendMail({
        to: user.email,
        from: "bendu@bendu.com",
        html: "<h1>BENDU KI BRAIN LEDU<h1/>",
      });
    } catch (error) {
      console.log("errorfrommailTrap:", error);
    }

    res.status(201).json({ user });
  } catch (error) {
    res.json({ error: error });
  }
};
