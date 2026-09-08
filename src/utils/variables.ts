const { env } = process as { env: { [key: string]: string | undefined } };

const normalizeEnvValue = (value?: string) => {
  if (!value) return "";

  return value.trim().replace(/^['"]|['"]$/g, "");
};

export const MONGO_URI = normalizeEnvValue(env.MONGO_URI);
export const BREVO_API_KEY = normalizeEnvValue(env.BREVO_API_KEY);
export const MAIL_FROM_EMAIL = normalizeEnvValue(env.MAIL_FROM_EMAIL) || "no-reply@research-pal.com";
export const MAIL_FROM_NAME = normalizeEnvValue(env.MAIL_FROM_NAME) || "ResearchPal";
export const TOKEN_KEY = normalizeEnvValue(env.TOKEN_KEY);
const configuredPasswordResetLink = normalizeEnvValue(process.env.PASSWORD_RESET_LINK);
if (process.env.NODE_ENV === "production" && (!configuredPasswordResetLink || !configuredPasswordResetLink.startsWith("https://"))) {
  throw new Error("PASSWORD_RESET_LINK must be an HTTPS URL in production.");
}
export const PASSWORD_RESET_LINK = configuredPasswordResetLink || "http://localhost:5173";

if (process.env.NODE_ENV === "production" && (!MONGO_URI || !TOKEN_KEY || !BREVO_API_KEY || !MAIL_FROM_EMAIL || !MAIL_FROM_NAME)) {
  throw new Error("Missing required production environment configuration.");
}
