import jwt, { SignOptions } from "jsonwebtoken";

interface GenerateTokenPayload {
  adminId: string;
  role: string;
}

export const generateToken = (payload: GenerateTokenPayload): string => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET nije definisan u .env fajlu.");
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

  return jwt.sign(payload, jwtSecret, {
    expiresIn,
  } as SignOptions);
};