import { Email } from "../mail/WelcomeMail";
import { MAILTRAP_PASSWORD, MAILTRAP_USER } from "../utils/variables";
import nodemailer from "nodemailer";
import { VERIFICATIONEMAIL } from "./variables";
import emailVerificationToken from "../modals/userVerification";

interface Profile {
  name: string;
  email: string;
  userId: string;
}

const generateMailTransporter = () => {
  const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: MAILTRAP_USER,
      pass: MAILTRAP_PASSWORD,
    },
  });
  return transporter;
};
export const sendVerificationMail = async (token: string, profile: Profile) => {
  const transport = generateMailTransporter();

  const { name, email, userId } = profile;

  await emailVerificationToken.create({
    owner: userId,
    token: token,
  });

  transport.sendMail({
    to: email,
    from: VERIFICATIONEMAIL,
    html: Email({
      Otp: `Your OTP: ${token}`,
      userName: name,
      subject: "Verification Mail",
      message:
        "You are just a step away from accessing your research Pal account, We are sharing a verification code to access your account. The code is valid for 10 minutes and usable only once.",
    }),
  });
};
