import { Email } from "../mail/WelcomeMail";
import { GMAIL_USER, GMAIL_PASS, VERIFICATIONEMAIL } from "../utils/variables";
import nodemailer from "nodemailer";

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

const getSenderAddress = () => {
  if (!GMAIL_USER) {
    throw new Error("Missing GMAIL_USER environment variable for email transport.");
  }

  return VERIFICATIONEMAIL && VERIFICATIONEMAIL.toLowerCase() === GMAIL_USER.toLowerCase()
    ? VERIFICATIONEMAIL
    : GMAIL_USER;
};

const createTransporter = () => {
  if (!GMAIL_USER || !GMAIL_PASS) {
    throw new Error("Missing GMAIL_USER or GMAIL_PASS environment variables for Gmail authentication.");
  }

  // Gmail app passwords are shown with spaces for readability.
  const cleanPassword = GMAIL_PASS.replace(/\s/g, "");

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: GMAIL_USER,
      pass: cleanPassword,
    },
  });
};

const sendEmailViaGmail = async (mailOptions: {
  to: string;
  from: string;
  html: string;
  subject?: string;
  replyTo?: string;
}): Promise<void> => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      ...mailOptions,
      from: getSenderAddress(),
      replyTo: mailOptions.replyTo || mailOptions.from,
    });
  } catch (error) {
    console.error("Transactional email delivery failed.");

    if (error instanceof Error && "code" in error && error.code === "EAUTH") {
      throw new Error(
        "Gmail authentication failed. Verify that GMAIL_USER matches the Google account that generated the App Password, 2-Step Verification is enabled on that account, and GMAIL_PASS is the 16-character App Password."
      );
    }

    throw error;
  }
};

export const sendVerificationMail = async (token: string, profile: Profile) => {
  const { name, email, userId } = profile;

  await sendEmailViaGmail({
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
  const { link, email } = options;

  await sendEmailViaGmail({
    to: email,
    from: VERIFICATIONEMAIL,
    html: Email({
      userName: email,
      subject: "Reset Password Link",
      button: link,
      message:
        "We just recieved a request that you forgot your password. Click on the link and reset your password.",
      title: "Forgot password",
    }),
  });
};

export const sendSuccessEmail = async (profile: Profile) => {
  const { name, email } = profile;

  await sendEmailViaGmail({
    to: email,
    from: VERIFICATIONEMAIL,
    html: Email({
      userName: name,
      subject: "Success Mail",
      message:
        "Your password has been changed successfully!",
    }),
  });
};

export const sendAccountDeletionCode = async (code: string, profile: Profile) => {
  await sendEmailViaGmail({
    to: profile.email,
    from: VERIFICATIONEMAIL,
    subject: "Confirm ResearchPal account deletion",
    html: Email({
      userName: profile.name,
      subject: "Confirm ResearchPal account deletion",
      title: "Confirm account deletion",
      Otp: `Your verification code is: ${code}`,
      message: "We received a request to permanently delete your ResearchPal account. This code expires in 10 minutes. If you did not request account deletion, you can ignore this email.",
    }),
  });
};
