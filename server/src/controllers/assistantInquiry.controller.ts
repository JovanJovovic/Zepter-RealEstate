import { Request, Response } from "express";
import mongoose from "mongoose";

import AssistantInquiry, { AssistantInquiryType } from "../models/AssistantInquiry.js";
import Property from "../models/Property.js";

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

const inquiryTypes: AssistantInquiryType[] = [
  "assistant-widget",
  "property-contact-form",
  "contact-page-form",
];

export const createAssistantInquiry = async (req: Request, res: Response) => {
  const question = normalizeNullableString(req.body.question);
  const name = normalizeNullableString(req.body.name);
  const email = normalizeNullableString(req.body.email)?.toLowerCase() || null;
  const phone = normalizeNullableString(req.body.phone);
  const inquiryType = normalizeNullableString(req.body.inquiryType) || "assistant-widget";

  if (!question) {
    return res.status(400).json({
      message: "Question is required.",
    });
  }

  if (!inquiryTypes.includes(inquiryType as AssistantInquiryType)) {
    return res.status(400).json({
      message: "Inquiry type is not valid.",
    });
  }

  if (inquiryType !== "assistant-widget" && !name) {
    return res.status(400).json({
      message: "Name is required.",
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

  let propertyContext = {
    propertyId: normalizeNullableString(req.body.propertyId),
    propertyPublicId: normalizeNullableString(req.body.propertyPublicId),
    propertySlug: normalizeNullableString(req.body.propertySlug),
    propertyName: normalizeNullableString(req.body.propertyName),
  };

  if (inquiryType === "property-contact-form") {
    const propertyFilters: Record<string, unknown>[] = [];

    if (propertyContext.propertyId && mongoose.isValidObjectId(propertyContext.propertyId)) {
      propertyFilters.push({ _id: propertyContext.propertyId });
    }

    if (propertyContext.propertyPublicId) {
      propertyFilters.push({ publicId: propertyContext.propertyPublicId });
    }

    if (propertyContext.propertySlug) {
      propertyFilters.push({ slug: propertyContext.propertySlug });
    }

    const property = propertyFilters.length
      ? await Property.findOne({ status: "published", $or: propertyFilters }).select(
          "_id publicId slug title"
        )
      : null;

    if (!property) {
      return res.status(400).json({
        message: "Property context is not valid.",
      });
    }

    propertyContext = {
      propertyId: String(property._id),
      propertyPublicId: property.publicId,
      propertySlug: property.slug,
      propertyName: property.title,
    };
  }

  const inquiry = await AssistantInquiry.create({
    question,
    name,
    email,
    phone,
    inquiryType,
    sourcePage: normalizeNullableString(req.body.sourcePage),
    pageTitle: normalizeNullableString(req.body.pageTitle),
    ...propertyContext,
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
