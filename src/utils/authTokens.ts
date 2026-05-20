import { compare, hash } from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import { TOKEN_KEY } from "./variables";

const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "30d";
const EMAIL_VERIFICATION_EXPIRES_IN = "10m";
const PASSWORD_RESET_EXPIRES_IN = "1h";
const REFRESH_TOKEN_DAYS = 30;

export interface AuthTokenPayload extends JwtPayload {
  userId: string;
  type: "access" | "refresh" | "email-verification" | "password-reset";
  codeHash?: string;
}

export const getRefreshTokenExpiry = () => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_DAYS);
  return expiresAt;
};

export const signAccessToken = (userId: string) =>
  jwt.sign({ userId, type: "access" }, TOKEN_KEY, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });

export const signRefreshToken = (userId: string) =>
  jwt.sign({ userId, type: "refresh" }, TOKEN_KEY, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });

export const signEmailVerificationToken = (
  userId: string,
  codeHash: string,
) =>
  jwt.sign({ userId, codeHash, type: "email-verification" }, TOKEN_KEY, {
    expiresIn: EMAIL_VERIFICATION_EXPIRES_IN,
  });

export const signPasswordResetToken = (userId: string) =>
  jwt.sign({ userId, type: "password-reset" }, TOKEN_KEY, {
    expiresIn: PASSWORD_RESET_EXPIRES_IN,
  });

export const hashRefreshToken = (token: string) => hash(token, 10);

export const hashEmailCode = (code: string) => hash(code, 10);

export const compareEmailCode = (code: string, codeHash: string) =>
  compare(code, codeHash);

export const verifyAuthToken = (
  token: string,
  expectedType: AuthTokenPayload["type"],
) => {
  const payload = jwt.verify(token, TOKEN_KEY) as AuthTokenPayload;

  if (payload.type !== expectedType || !payload.userId) {
    throw new Error("Invalid token type");
  }

  return payload;
};

export const findRefreshTokenIndex = async (
  refreshTokens: { token: string; expiresAt: Date }[],
  token: string,
) => {
  const now = Date.now();

  for (let i = 0; i < refreshTokens.length; i += 1) {
    const stored = refreshTokens[i];
    if (new Date(stored.expiresAt).getTime() <= now) continue;

    if (await compare(token, stored.token)) {
      return i;
    }
  }

  return -1;
};
