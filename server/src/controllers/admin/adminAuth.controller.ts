import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";

import Admin from "../../models/Admin.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";

const createAdminToken = (adminId: string, role: string): string => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET nije definisan u .env fajlu.");
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

  return jwt.sign(
    {
      adminId,
      role,
    },
    jwtSecret,
    {
      expiresIn,
    } as SignOptions
  );
};

const setAdminCookie = (res: Response, token: string) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("adminToken", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const loginAdmin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email i lozinka su obavezni.",
    });
  }

  const admin = await Admin.findOne({
    email: String(email).toLowerCase(),
  }).select("+passwordHash");

  if (!admin || !admin.isActive) {
    return res.status(401).json({
      message: "Neispravni kredencijali.",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);

  if (!isPasswordValid) {
    return res.status(401).json({
      message: "Neispravni kredencijali.",
    });
  }

  admin.lastLoginAt = new Date();
  await admin.save();

  const token = createAdminToken(admin._id.toString(), admin.role);

  setAdminCookie(res, token);

  res.json({
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
    token,
  });
};

export const logoutAdmin = async (_req: Request, res: Response) => {
  res.clearCookie("adminToken");

  res.json({
    message: "Uspešno ste se odjavili.",
  });
};

export const getCurrentAdmin = async (req: AuthRequest, res: Response) => {
  res.json({
    admin: req.admin,
  });
};