const { env } = process as { env: { [key: string]: string } };

export const {
  MONGO_URI,
  GMAIL_USER,
  GMAIL_PASS,
  VERIFICATIONEMAIL,
  PASSWORD_RESET_LINK,
  TOKEN_KEY,
  TEMPORARY_OTP,
} = env;
