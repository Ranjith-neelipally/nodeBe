const { env } = process as { env: { [key: string]: string } };

export const {
  MONGO_URI,
  MAILTRAP_USER,
  MAILTRAP_PASSWORD,
  VERIFICATIONEMAIL,
  PASSWORD_RESET_LINK,
  TOKEN_KEY,
} = env;
