import { Email } from "../mail/WelcomeMail";
import { BREVO_API_KEY, MAIL_FROM_EMAIL, MAIL_FROM_NAME } from "../utils/variables";
import { AppError } from "./AppError";

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

const BREVO_TRANSACTIONAL_EMAIL_URL = "https://api.brevo.com/v3/smtp/email";

type BrevoSendEmailResponse = {
  messageId?: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const readBrevoErrorBody = async (response: Response) => {
  try {
    const body = await response.json();
    if (!isRecord(body)) return undefined;

    return {
      code: typeof body.code === "string" ? body.code : undefined,
      message: typeof body.message === "string" ? body.message : undefined,
    };
  } catch {
    return undefined;
  }
};

const createBrevoError = (
  status: number,
  body?: { code?: string; message?: string },
) => {
  if (status === 401 || status === 403) {
    return new AppError(
      "Brevo API authentication failed. Verify BREVO_API_KEY.",
      503,
      "EMAIL_DELIVERY_UNAVAILABLE",
    );
  }

  const message = body?.message?.toLowerCase() || "";
  if (message.includes("sender") || message.includes("from")) {
    return new AppError(
      "The configured sender email is not authorized in Brevo.",
      503,
      "EMAIL_DELIVERY_UNAVAILABLE",
    );
  }

  return new AppError(
    "Transactional email delivery failed.",
    503,
    "EMAIL_DELIVERY_UNAVAILABLE",
  );
};

const sendEmailViaBrevo = async (mailOptions: {
  to: string;
  html: string;
  subject: string;
  purpose: string;
}): Promise<void> => {
  if (!BREVO_API_KEY || !MAIL_FROM_EMAIL || !MAIL_FROM_NAME) {
    throw new AppError(
      "Email delivery is not configured.",
      503,
      "EMAIL_DELIVERY_UNAVAILABLE",
    );
  }

  try {
    const response = await fetch(BREVO_TRANSACTIONAL_EMAIL_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          email: MAIL_FROM_EMAIL,
          name: MAIL_FROM_NAME,
        },
        to: [{ email: mailOptions.to }],
        subject: mailOptions.subject,
        htmlContent: mailOptions.html,
      }),
    });

    if (!response.ok) {
      const body = await readBrevoErrorBody(response);
      console.error("Transactional email delivery failed.", {
        purpose: mailOptions.purpose,
        recipient: mailOptions.to,
        provider: "brevo",
        status: response.status,
        code: body?.code,
      });
      throw createBrevoError(response.status, body);
    }

    const body = (await response.json()) as BrevoSendEmailResponse;
    console.info("Transactional email delivered.", {
      purpose: mailOptions.purpose,
      recipient: mailOptions.to,
      provider: "brevo",
      messageId: body.messageId,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error("Transactional email delivery failed.", {
      purpose: mailOptions.purpose,
      recipient: mailOptions.to,
      provider: "brevo",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw new AppError(
      "Transactional email delivery failed.",
      503,
      "EMAIL_DELIVERY_UNAVAILABLE",
    );
  }
};

export const sendVerificationMail = async (token: string, profile: Profile) => {
  const { name, email, userId } = profile;

  await sendEmailViaBrevo({
    to: email,
    subject: "Verification Mail",
    purpose: "verification",
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

  await sendEmailViaBrevo({
    to: email,
    subject: "Reset Password Link",
    purpose: "password_reset",
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

  await sendEmailViaBrevo({
    to: email,
    subject: "Success Mail",
    purpose: "password_changed",
    html: Email({
      userName: name,
      subject: "Success Mail",
      message:
        "Your password has been changed successfully!",
    }),
  });
};

export const sendAccountDeletionCode = async (code: string, profile: Profile) => {
  await sendEmailViaBrevo({
    to: profile.email,
    subject: "Confirm ResearchPal account deletion",
    purpose: "account_deletion",
    html: Email({
      userName: profile.name,
      subject: "Confirm ResearchPal account deletion",
      title: "Confirm account deletion",
      Otp: `Your verification code is: ${code}`,
      message: "We received a request to permanently delete your ResearchPal account. This code expires in 10 minutes. If you did not request account deletion, you can ignore this email.",
    }),
  });
};
