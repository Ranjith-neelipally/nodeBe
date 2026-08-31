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
const configuredPasswordResetLink = normalizeEnvValue(process.env.PASSWORD_RESET_LINK);
if (process.env.NODE_ENV === "production" && (!configuredPasswordResetLink || !configuredPasswordResetLink.startsWith("https://"))) {
  throw new Error("PASSWORD_RESET_LINK must be an HTTPS URL in production.");
}
export const PASSWORD_RESET_LINK = configuredPasswordResetLink || "http://localhost:5173";

if (process.env.NODE_ENV === "production" && (!MONGO_URI || !TOKEN_KEY || !GMAIL_USER || !GMAIL_PASS)) {
  throw new Error("Missing required production environment configuration.");
}
