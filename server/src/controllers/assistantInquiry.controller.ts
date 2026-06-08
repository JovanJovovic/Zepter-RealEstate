import { Request, Response } from "express";

import AssistantInquiry from "../models/AssistantInquiry.js";

const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidPhone = (phone: string): boolean => {
  const normalized = phone.replace(/[\s().-]/g, "");
  return /^\+?\d{6,20}$/.test(normalized);
};

const normalizeNullableString = (value: unknown) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
};

export const createAssistantInquiry = async (req: Request, res: Response) => {
  const question = normalizeNullableString(req.body.question);
  const email = normalizeNullableString(req.body.email)?.toLowerCase() || null;
  const phone = normalizeNullableString(req.body.phone);

  if (!question) {
    return res.status(400).json({
      message: "Question is required.",
    });
  }

  if (!email && !phone) {
    return res.status(400).json({
      message: "Please leave an email address or phone number.",
    });
  }

  if (email && !isValidEmail(email)) {
    return res.status(400).json({
      message: "Email address is not valid.",
    });
  }

  if (phone && !isValidPhone(phone)) {
    return res.status(400).json({
      message: "Phone number is not valid.",
    });
  }

  const inquiry = await AssistantInquiry.create({
    question,
    email,
    phone,
    sourcePage: normalizeNullableString(req.body.sourcePage),
    pageTitle: normalizeNullableString(req.body.pageTitle),
    propertyId: normalizeNullableString(req.body.propertyId),
    propertyName: normalizeNullableString(req.body.propertyName),
  });

  res.status(201).json({
    message: "Thank you. Our team will contact you soon.",
    inquiry: {
      id: inquiry._id,
      status: inquiry.status,
      createdAt: inquiry.createdAt,
    },
  });
};
