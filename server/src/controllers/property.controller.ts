import { Request, Response } from "express";
import slugify from "slugify";
import Property from "../models/Property.js";
import { localizeProperty, normalizeLanguage } from "../utils/propertyTranslations.js";
import {
  DEFAULT_OCCUPANCY_PERCENTAGE,
  OCCUPANCY_PERCENTAGE_ERROR,
  buildAvailabilityFields,
} from "../utils/propertyAvailability.js";

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

const buildPropertyAvailabilityData = (
  data: Record<string, unknown>,
  existingProperty?: { sizeSqm?: number; occupancyPercentage?: number }
) => {
  delete data.availableArea;

  const totalArea = data.sizeSqm ?? existingProperty?.sizeSqm;
  const occupancyPercentage =
    data.occupancyPercentage ??
    existingProperty?.occupancyPercentage ??
    DEFAULT_OCCUPANCY_PERCENTAGE;

  return {
    ...data,
    ...buildAvailabilityFields(totalArea, occupancyPercentage),
  };
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
    language: _language,
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
    const availableAreaRange: Record<string, number> = {};

    if (parsedMinSize !== undefined) {
      availableAreaRange.$gte = parsedMinSize;
    }

    if (parsedMaxSize !== undefined) {
      availableAreaRange.$lte = parsedMaxSize;
    }

    filter.$and = [
      ...((filter.$and as Record<string, unknown>[] | undefined) || []),
      {
        $or: [
          { availableArea: availableAreaRange },
          { availableArea: { $exists: false }, sizeSqm: availableAreaRange },
          { availableArea: null, sizeSqm: availableAreaRange },
        ],
      },
    ];
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
      { "translations.title": { $regex: String(search), $options: "i" } },
      { "translations.shortDescription": { $regex: String(search), $options: "i" } },
      { "translations.fullDescription": { $regex: String(search), $options: "i" } },
      { "translations.aboutProperty": { $regex: String(search), $options: "i" } },
      { "translations.location.fullLocation": { $regex: String(search), $options: "i" } },
      { "translations.location.address": { $regex: String(search), $options: "i" } },
    ];
  }

  return filter;
};

export const getProperties = async (req: Request, res: Response) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 9, 1), 100);
  const skip = (page - 1) * limit;

  const filter = buildPropertyFilter(req.query);
  const language = normalizeLanguage(req.query.language);

  const [items, total] = await Promise.all([
    Property.find(filter).sort({ isFeatured: -1, createdAt: -1 }).skip(skip).limit(limit),
    Property.countDocuments(filter),
  ]);

  res.json({
    items: items.map((property) => localizeProperty(property, language)),
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
};

export const getFeaturedProperties = async (req: Request, res: Response) => {
  const language = normalizeLanguage(req.query.language);
  const properties = await Property.find({
    status: "published",
    isFeatured: true,
  })
    .sort({ createdAt: -1 })
    .limit(6);

  res.json(properties.map((property) => localizeProperty(property, language)));
};

export const getPropertyBySlug = async (req: Request, res: Response) => {
  const language = normalizeLanguage(req.query.language);
  const property = await Property.findOne({
    slug: req.params.slug,
    status: "published",
  });

  if (!property) {
    return res.status(404).json({
      message: "Nekretnina nije pronađena.",
    });
  }

  res.json(localizeProperty(property, language));
};

export const getPropertyByPublicId = async (req: Request, res: Response) => {
  const language = normalizeLanguage(req.query.language);
  const property = await Property.findOne({
    publicId: req.params.publicId,
    status: "published",
  });

  if (!property) {
    return res.status(404).json({
      message: "Nekretnina nije pronađena.",
    });
  }

  res.json(localizeProperty(property, language));
};

export const createProperty = async (req: Request, res: Response) => {
  const slug = createSlug(req.body.title);

  const existingProperty = await Property.findOne({ slug });

  if (existingProperty) {
    return res.status(400).json({
      message: "Nekretnina sa ovim nazivom već postoji.",
    });
  }

  let propertyData;

  try {
    propertyData = buildPropertyAvailabilityData({
      ...req.body,
      slug,
    });
  } catch (error) {
    return res.status(400).json({
      message: error instanceof Error ? error.message : OCCUPANCY_PERCENTAGE_ERROR,
    });
  }

  const property = await Property.create(propertyData);

  res.status(201).json(property);
};

export const updateProperty = async (req: Request, res: Response) => {
  let updateData = { ...req.body };
  delete updateData.availableArea;

  if (req.body.title) {
    updateData.slug = createSlug(req.body.title);
  }

  const existingProperty = await Property.findById(req.params.id);

  if (!existingProperty) {
    return res.status(404).json({
      message: "Property not found.",
    });
  }

  try {
    updateData = buildPropertyAvailabilityData(updateData, existingProperty);
  } catch (error) {
    return res.status(400).json({
      message: error instanceof Error ? error.message : OCCUPANCY_PERCENTAGE_ERROR,
    });
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
