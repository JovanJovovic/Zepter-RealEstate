import { Request, Response } from "express";
import fs from "fs";

import PropertyOffer, { IPropertyOfferFile } from "../models/PropertyOffer.js";

type PropertyOfferFileMap = {
  images?: Express.Multer.File[];
  floorPlans?: Express.Multer.File[];
  documents?: Express.Multer.File[];
};

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

const parsePositiveNumber = (value: unknown) => {
  const normalized = normalizeNullableString(value);
  if (!normalized) return null;

  const parsed = Number(normalized.replace(",", "."));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : Number.NaN;
};

const getOfferFiles = (req: Request) => {
  return (req.files || {}) as PropertyOfferFileMap;
};

const allUploadedFiles = (files: PropertyOfferFileMap) => {
  return [
    ...(files.images || []),
    ...(files.floorPlans || []),
    ...(files.documents || []),
  ];
};

const cleanupUploadedFiles = (files: PropertyOfferFileMap) => {
  allUploadedFiles(files).forEach((file) => {
    fs.unlink(file.path, () => undefined);
  });
};

const fileMetadata = (file: Express.Multer.File): IPropertyOfferFile => ({
  originalName: file.originalname,
  filename: file.filename,
  url: `/uploads/${file.filename}`,
  mimeType: file.mimetype,
  size: file.size,
  uploadedAt: new Date(),
});

const validateGroupedFiles = (files: PropertyOfferFileMap) => {
  const invalidImage = (files.images || []).find((file) => !file.mimetype.startsWith("image/"));

  if (invalidImage) {
    return "Slike nekretnine moraju biti JPG, PNG, WEBP ili GIF fajlovi.";
  }

  const invalidFloorPlan = (files.floorPlans || []).find(
    (file) => !file.mimetype.startsWith("image/") && file.mimetype !== "application/pdf"
  );

  if (invalidFloorPlan) {
    return "Nacrti mogu biti slike ili PDF dokumenti.";
  }

  const invalidDocument = (files.documents || []).find(
    (file) => !file.mimetype.startsWith("image/") && file.mimetype !== "application/pdf"
  );

  if (invalidDocument) {
    return "Dokumentacija moze biti slika ili PDF dokument.";
  }

  return null;
};

export const createPropertyOffer = async (req: Request, res: Response) => {
  const files = getOfferFiles(req);
  const firstName = normalizeNullableString(req.body.firstName);
  const lastName = normalizeNullableString(req.body.lastName);
  const email = normalizeNullableString(req.body.email)?.toLowerCase() || null;
  const phone = normalizeNullableString(req.body.phone);
  const propertyType = normalizeNullableString(req.body.propertyType);
  const city = normalizeNullableString(req.body.city);
  const address = normalizeNullableString(req.body.address);
  const fullLocation = normalizeNullableString(req.body.fullLocation);
  const area = parsePositiveNumber(req.body.area);
  const proposedPrice = parsePositiveNumber(req.body.proposedPrice);
  const currency = normalizeNullableString(req.body.currency)?.toUpperCase() || "EUR";

  const fail = (message: string) => {
    cleanupUploadedFiles(files);
    return res.status(400).json({ message });
  };

  if (!firstName) return fail("Ime je obavezno.");
  if (!lastName) return fail("Prezime je obavezno.");
  if (!email && !phone) return fail("Ostavite email adresu ili broj telefona.");
  if (email && !isValidEmail(email)) return fail("Email adresa nije validna.");
  if (phone && !isValidPhone(phone)) return fail("Broj telefona nije validan.");
  if (!propertyType) return fail("Tip nekretnine je obavezan.");
  if (!city) return fail("Grad je obavezan.");
  if (!address && !fullLocation) return fail("Adresa ili lokacija je obavezna.");
  if (area === null || Number.isNaN(area)) return fail("Povrsina mora biti pozitivan broj.");
  if (proposedPrice === null || Number.isNaN(proposedPrice)) return fail("Predlozena cena mora biti pozitivan broj.");

  const fileValidationError = validateGroupedFiles(files);
  if (fileValidationError) return fail(fileValidationError);

  const offer = await PropertyOffer.create({
    firstName,
    lastName,
    email,
    phone,
    propertyType,
    city,
    municipality: normalizeNullableString(req.body.municipality),
    address,
    fullLocation,
    area,
    proposedPrice,
    currency,
    description: normalizeNullableString(req.body.description),
    images: (files.images || []).map(fileMetadata),
    floorPlans: (files.floorPlans || []).map(fileMetadata),
    documents: (files.documents || []).map(fileMetadata),
  });

  res.status(201).json({
    message: "Hvala. Vasa ponuda je poslata nasem timu. Kontaktiracemo Vas nakon pregleda.",
    offer: {
      id: offer._id,
      status: offer.status,
      createdAt: offer.createdAt,
    },
  });
};
