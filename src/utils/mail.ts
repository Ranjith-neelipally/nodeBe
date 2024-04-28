import { Email } from "../mail/WelcomeMail";
import { MAILTRAP_PASSWORD, MAILTRAP_USER } from "../utils/variables";
import nodemailer from "nodemailer";
import { VERIFICATIONEMAIL } from "./variables";

interface Profile {
  name: string;
  email: string;
  userId?: string;
}

interface resetPassword {
  email: string;
  link: string;
  name: string;
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

export const sendPasswordResetMail = async (options: resetPassword) => {
  const transport = generateMailTransporter();

  const { link, email } = options;

  transport.sendMail({
    to: email,
    from: VERIFICATIONEMAIL,
    html: Email({
      userName: email,
      subject: "Reset Password Link",
      button: link,
      message:
        "We just recieved a request yjay you forgot your password. Click on the link and reset your password.",
      title: "Forgot password",
    }),
  });
};

export const sendSuccessEmail = async ( profile: Profile) => {
  const transport = generateMailTransporter();

  const { name, email } = profile;

  transport.sendMail({
    to: email,
    from: VERIFICATIONEMAIL,
    html: Email({
      userName: name,
      subject: "Success Mail",
      message:
        "your Password has changed Successfully !",
    }),
  });
};