import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import Admin from "../models/Admin.js";

interface AdminTokenPayload extends JwtPayload {
  adminId: string;
  role: string;
}

export interface AuthRequest extends Request {
  admin?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const protectAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      res.status(500).json({
        message: "JWT_SECRET nije definisan.",
      });
      return;
    }

    const cookieToken = req.cookies?.adminToken;

    const authHeader = req.headers.authorization;
    const bearerToken =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : undefined;

    const token = cookieToken || bearerToken;

    if (!token) {
      res.status(401).json({
        message: "Niste autorizovani.",
      });
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as AdminTokenPayload;

    const admin = await Admin.findById(decoded.adminId);

    if (!admin || !admin.isActive) {
      res.status(401).json({
        message: "Admin nalog nije pronađen ili nije aktivan.",
      });
      return;
    }

    req.admin = {
      id: admin._id.toString(),
      name: admin.name,
      email: admin.email,
      role: admin.role,
    };

    next();
  } catch {
    res.status(401).json({
      message: "Token nije validan ili je istekao.",
    });
  }
};