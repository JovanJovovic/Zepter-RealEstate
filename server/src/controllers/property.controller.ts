import { Request, Response } from "express";
import slugify from "slugify";
import Property from "../models/Property.js";

const createSlug = (title: string): string => {
  return slugify(title, {
    lower: true,
    strict: true,
    locale: "sr",
  });
};

const parsePositiveNumber = (value: unknown): number | undefined => {
  if (!value) return undefined;

  const parsed = Number(value);

  if (Number.isNaN(parsed) || parsed < 0) {
    return undefined;
  }

  return parsed;
};

const buildPropertyFilter = (query: Request["query"]) => {
  const {
    category,
    type,
    location,
    condition,
    rooms,
    specialRequirement,
    minSize,
    maxSize,
    status = "published",
    featured,
    search,
  } = query;

  const filter: Record<string, unknown> = {};

  if (status) {
    filter.status = status;
  }

  if (category) {
    filter.category = category;
  }

  if (type) {
    const types = Array.isArray(type) ? type : String(type).split(",");
    filter.types = { $in: types };
  }

  if (location) {
    filter["location.fullLocation"] = {
      $regex: String(location),
      $options: "i",
    };
  }

  if (condition) {
    filter.condition = condition;
  }

  if (rooms) {
    filter.rooms = rooms;
  }

  if (specialRequirement) {
    const requirements = Array.isArray(specialRequirement)
      ? specialRequirement
      : String(specialRequirement).split(",");

    filter.specialRequirements = {
      $all: requirements,
    };
  }

  const parsedMinSize = parsePositiveNumber(minSize);
  const parsedMaxSize = parsePositiveNumber(maxSize);

  if (parsedMinSize !== undefined || parsedMaxSize !== undefined) {
    filter.sizeSqm = {};

    if (parsedMinSize !== undefined) {
      (filter.sizeSqm as Record<string, number>).$gte = parsedMinSize;
    }

    if (parsedMaxSize !== undefined) {
      (filter.sizeSqm as Record<string, number>).$lte = parsedMaxSize;
    }
  }

  if (featured === "true") {
    filter.isFeatured = true;
  }

  if (search) {
    filter.$or = [
      { title: { $regex: String(search), $options: "i" } },
      { shortDescription: { $regex: String(search), $options: "i" } },
      { fullDescription: { $regex: String(search), $options: "i" } },
      { aboutProperty: { $regex: String(search), $options: "i" } },
      { "location.fullLocation": { $regex: String(search), $options: "i" } },
      { "location.address": { $regex: String(search), $options: "i" } },
    ];
  }

  return filter;
};

export const getProperties = async (req: Request, res: Response) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 9, 1), 100);
  const skip = (page - 1) * limit;

  const filter = buildPropertyFilter(req.query);

  const [items, total] = await Promise.all([
    Property.find(filter).sort({ isFeatured: -1, createdAt: -1 }).skip(skip).limit(limit),
    Property.countDocuments(filter),
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

export const getFeaturedProperties = async (_req: Request, res: Response) => {
  const properties = await Property.find({
    status: "published",
    isFeatured: true,
  })
    .sort({ createdAt: -1 })
    .limit(6);

  res.json(properties);
};

export const getPropertyBySlug = async (req: Request, res: Response) => {
  const property = await Property.findOne({
    slug: req.params.slug,
    status: "published",
  });

  if (!property) {
    return res.status(404).json({
      message: "Nekretnina nije pronađena.",
    });
  }

  res.json(property);
};

export const getPropertyByPublicId = async (req: Request, res: Response) => {
  const property = await Property.findOne({
    publicId: req.params.publicId,
    status: "published",
  });

  if (!property) {
    return res.status(404).json({
      message: "Nekretnina nije pronađena.",
    });
  }

  res.json(property);
};

export const createProperty = async (req: Request, res: Response) => {
  const slug = createSlug(req.body.title);

  const existingProperty = await Property.findOne({ slug });

  if (existingProperty) {
    return res.status(400).json({
      message: "Nekretnina sa ovim nazivom već postoji.",
    });
  }

  const property = await Property.create({
    ...req.body,
    slug,
  });

  res.status(201).json(property);
};

export const updateProperty = async (req: Request, res: Response) => {
  const updateData = { ...req.body };

  if (req.body.title) {
    updateData.slug = createSlug(req.body.title);
  }

  const property = await Property.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!property) {
    return res.status(404).json({
      message: "Nekretnina nije pronađena.",
    });
  }

  res.json(property);
};

export const deleteProperty = async (req: Request, res: Response) => {
  const property = await Property.findByIdAndDelete(req.params.id);

  if (!property) {
    return res.status(404).json({
      message: "Nekretnina nije pronađena.",
    });
  }

  res.json({
    message: "Nekretnina je uspešno obrisana.",
  });
};