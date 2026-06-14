import { Request, Response } from "express";

import Property from "../../models/Property.js";
import { slugifyText } from "../../utils/slugifyText.js";
import { generatePublicId } from "../../utils/generatePublicId.js";
import { localizeProperty, normalizeLanguage } from "../../utils/propertyTranslations.js";
import {
    DEFAULT_OCCUPANCY_PERCENTAGE,
    OCCUPANCY_PERCENTAGE_ERROR,
    buildAvailabilityFields,
} from "../../utils/propertyAvailability.js";


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

const buildAdminPropertyFilter = (query: Request["query"]) => {
    const {
        category,
        type,
        location,
        condition,
        rooms,
        specialRequirement,
        minSize,
        maxSize,
        status,
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

    if (featured === "false") {
        filter.isFeatured = false;
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

export const getAdminProperties = async (req: Request, res: Response) => {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const filter = buildAdminPropertyFilter(req.query);
    const language = normalizeLanguage(req.query.language);

    const [items, total] = await Promise.all([
        Property.find(filter)
            .sort({ updatedAt: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit),
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

export const getAdminPropertyById = async (req: Request, res: Response) => {
    const property = await Property.findById(req.params.id);

    if (!property) {
        return res.status(404).json({
            message: "Nekretnina nije pronađena.",
        });
    }

    res.json(property);
};

export const createProperty = async (req: Request, res: Response) => {
    if (!req.body.title) {
        return res.status(400).json({
            message: "Naziv nekretnine je obavezan.",
        });
    }

    const slug = req.body.slug ? slugifyText(req.body.slug) : slugifyText(req.body.title);

    const existingProperty = await Property.findOne({ slug });

    if (existingProperty) {
        return res.status(400).json({
            message: "Nekretnina sa ovim slug-om već postoji.",
        });
    }

    let propertyData;

    try {
        propertyData = buildPropertyAvailabilityData({
            ...req.body,
            slug,
            publicId: req.body.publicId || generatePublicId(),
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

    if (req.body.slug) {
        updateData.slug = slugifyText(req.body.slug);
    } else if (req.body.title) {
        updateData.slug = slugifyText(req.body.title);
    }

    if (updateData.slug) {
        const existingProperty = await Property.findOne({
            slug: updateData.slug,
            _id: { $ne: req.params.id },
        });

        if (existingProperty) {
            return res.status(400).json({
                message: "Druga nekretnina sa ovim slug-om već postoji.",
            });
        }
    }

    if (updateData.publicId) {
        const existingPublicId = await Property.findOne({
            publicId: updateData.publicId,
            _id: { $ne: req.params.id },
        });

        if (existingPublicId) {
            return res.status(400).json({
                message: "Druga nekretnina sa ovim publicId već postoji.",
            });
        }
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
        returnDocument: "after",
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
        deletedProperty: {
            id: property._id,
            title: property.title,
            slug: property.slug,
        },
    });
};
