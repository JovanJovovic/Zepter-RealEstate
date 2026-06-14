import { Request, Response } from "express";

import PropertyOffer, { PropertyOfferStatus } from "../../models/PropertyOffer.js";

const statuses: PropertyOfferStatus[] = ["new", "reviewed", "contacted", "accepted", "rejected"];

export const getPropertyOffers = async (req: Request, res: Response) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const skip = (page - 1) * limit;

  const { search, status } = req.query;
  const filter: Record<string, unknown> = {};

  if (typeof status === "string" && statuses.includes(status as PropertyOfferStatus)) {
    filter.status = status;
  }

  if (search) {
    const searchRegex = {
      $regex: String(search),
      $options: "i",
    };

    filter.$or = [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
      { propertyType: searchRegex },
      { city: searchRegex },
      { municipality: searchRegex },
      { address: searchRegex },
      { fullLocation: searchRegex },
      { description: searchRegex },
    ];
  }

  const [items, total] = await Promise.all([
    PropertyOffer.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    PropertyOffer.countDocuments(filter),
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

export const getPropertyOfferById = async (req: Request, res: Response) => {
  const offer = await PropertyOffer.findById(req.params.id);

  if (!offer) {
    return res.status(404).json({
      message: "Property offer not found.",
    });
  }

  res.json(offer);
};

export const updatePropertyOfferStatus = async (req: Request, res: Response) => {
  const { status } = req.body;

  if (!statuses.includes(status)) {
    return res.status(400).json({
      message: "Property offer status is not valid.",
    });
  }

  const offer = await PropertyOffer.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!offer) {
    return res.status(404).json({
      message: "Property offer not found.",
    });
  }

  res.json({
    message: "Property offer status has been updated.",
    offer,
  });
};

export const updatePropertyOfferInternalNote = async (req: Request, res: Response) => {
  const internalNote = typeof req.body.internalNote === "string" ? req.body.internalNote.trim() : "";

  const offer = await PropertyOffer.findByIdAndUpdate(
    req.params.id,
    { internalNote: internalNote || null },
    { new: true, runValidators: true }
  );

  if (!offer) {
    return res.status(404).json({
      message: "Property offer not found.",
    });
  }

  res.json({
    message: "Internal note has been updated.",
    offer,
  });
};
