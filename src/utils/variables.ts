const { env } = process as { env: { [key: string]: string | undefined } };

const normalizeEnvValue = (value?: string) => {
  if (!value) return "";

  return value.trim().replace(/^['"]|['"]$/g, "");
};

export const MONGO_URI = normalizeEnvValue(env.MONGO_URI);
export const GMAIL_USER = normalizeEnvValue(env.GMAIL_USER);
export const GMAIL_PASS = normalizeEnvValue(env.GMAIL_PASS);
export const ADMIN_MAIL = normalizeEnvValue(env.ADMIN_MAIL);
export const TOKEN_KEY = normalizeEnvValue(env.TOKEN_KEY);

export const VERIFICATIONEMAIL = ADMIN_MAIL || GMAIL_USER;
export const PASSWORD_RESET_LINK = normalizeEnvValue(process.env.PASSWORD_RESET_LINK) || "http://localhost:1430";
