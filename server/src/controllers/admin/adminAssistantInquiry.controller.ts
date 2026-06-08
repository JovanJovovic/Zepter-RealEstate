import { Request, Response } from "express";

import AssistantInquiry, { AssistantInquiryStatus } from "../../models/AssistantInquiry.js";

const statuses: AssistantInquiryStatus[] = ["new", "in-progress", "answered", "archived"];

export const getAssistantInquiries = async (req: Request, res: Response) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const skip = (page - 1) * limit;

  const { search, status } = req.query;
  const filter: Record<string, unknown> = {};

  if (typeof status === "string" && statuses.includes(status as AssistantInquiryStatus)) {
    filter.status = status;
  }

  if (search) {
    const searchRegex = {
      $regex: String(search),
      $options: "i",
    };

    filter.$or = [
      { question: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
      { sourcePage: searchRegex },
      { propertyId: searchRegex },
      { propertyName: searchRegex },
    ];
  }

  const [items, total] = await Promise.all([
    AssistantInquiry.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AssistantInquiry.countDocuments(filter),
  ]);

  res.json({
    items,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
};

export const updateAssistantInquiryStatus = async (req: Request, res: Response) => {
  const { status } = req.body;

  if (!statuses.includes(status)) {
    return res.status(400).json({
      message: "Inquiry status is not valid.",
    });
  }

  const inquiry = await AssistantInquiry.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!inquiry) {
    return res.status(404).json({
      message: "Inquiry not found.",
    });
  }

  res.json({
    message: "Inquiry status has been updated.",
    inquiry,
  });
};
