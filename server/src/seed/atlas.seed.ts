import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "../config/db.js";

import Admin from "../models/Admin.js";
import Property from "../models/Property.js";
import AssistantInquiry from "../models/AssistantInquiry.js";
import NewsletterSubscriber from "../models/NewsletterSubscriber.js";
import PropertyOffer from "../models/PropertyOffer.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const toMongoValue = (value: any): any => {
  if (Array.isArray(value)) {
    return value.map(toMongoValue);
  }

  if (value && typeof value === "object") {
    if (typeof value.$oid === "string") {
      return new mongoose.Types.ObjectId(value.$oid);
    }

    if (typeof value.$date === "string") {
      return new Date(value.$date);
    }

    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, toMongoValue(nestedValue)])
    );
  }

  return value;
};

const loadJsonData = <T>(relativePath: string): T => {
  const fullPath = path.join(__dirname, relativePath);
  const raw = fs.readFileSync(fullPath, "utf-8");
  return toMongoValue(JSON.parse(raw)) as T;
};

const seedAdmin = async () => {
  const name = process.env.ADMIN_SEED_NAME || "Zepter Admin";
  const email = process.env.ADMIN_SEED_EMAIL || "admin@zepterrealestate.rs";
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!password) {
    throw new Error("ADMIN_SEED_PASSWORD mora biti definisan u .env fajlu.");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await Admin.findOneAndUpdate(
    { email: email.toLowerCase() },
    {
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: "super-admin",
      isActive: true,
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
    }
  );

  console.log(`Admin seeded: ${email}`);
};

const seedNewsletterSubscribers = async () => {
  const subscribers = [
    {
      email: "jovan.jovovic064@gmail.com",
      isActive: true,
      source: "website",
      subscribedAt: new Date("2026-05-01T17:47:21.469Z"),
      createdAt: new Date("2026-05-01T17:47:21.471Z"),
      updatedAt: new Date("2026-05-01T17:47:21.471Z"),
    },
  ];

  for (const subscriber of subscribers) {
    await NewsletterSubscriber.findOneAndUpdate(
      { email: subscriber.email.toLowerCase() },
      subscriber,
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    console.log(`Newsletter subscriber seeded: ${subscriber.email}`);
  }
};

const seedAssistantInquiries = async () => {
  const inquiries = [
    {
      question: "Test pitanje",
      email: "jovan.jovovic064@gmail.com",
      phone: null,
      sourcePage: "http://localhost:5173/",
      pageTitle: "client",
      propertyId: null,
      propertyName: null,
      status: "new",
      createdAt: new Date("2026-06-08T22:28:55.461Z"),
      updatedAt: new Date("2026-06-08T22:28:55.461Z"),
    },
  ];

  for (const inquiry of inquiries) {
    await AssistantInquiry.findOneAndUpdate(
      {
        question: inquiry.question,
        email: inquiry.email,
        createdAt: inquiry.createdAt,
      },
      inquiry,
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    console.log(`Assistant inquiry seeded: ${inquiry.question}`);
  }
};

const seedPropertyOffers = async () => {
  const offers = [
    {
      firstName: "Jovan",
      lastName: "Jovovic",
      email: "jovan.jovovic064@gmail.com",
      phone: "134534343",
      propertyType: "retails",
      city: "Beograd",
      municipality: "Palilula",
      address: "Ruzveltova 12",
      fullLocation: "Beograd, Palilula, Ruzveltova 12",
      area: 100,
      proposedPrice: 100000,
      currency: "EUR",
      description: "Test nekretnina",
      images: [
        {
          originalName: "Zepter Knez Mihajlova5.png",
          filename: "1781399994136-591344991-zepter-knez-mihajlova5.png",
          url: "/uploads/1781399994136-591344991-zepter-knez-mihajlova5.png",
          mimeType: "image/png",
          size: 3355465,
          uploadedAt: new Date("2026-06-14T01:19:54.183Z"),
        },
      ],
      floorPlans: [
        {
          originalName: "Nacrti.pdf",
          filename: "1781399994149-464269629-nacrti.pdf",
          url: "/uploads/1781399994149-464269629-nacrti.pdf",
          mimeType: "application/pdf",
          size: 2631969,
          uploadedAt: new Date("2026-06-14T01:19:54.183Z"),
        },
      ],
      documents: [
        {
          originalName: "IEP_Projekat_2026.pdf",
          filename: "1781399994178-166270708-iep_projekat_2026.pdf",
          url: "/uploads/1781399994178-166270708-iep_projekat_2026.pdf",
          mimeType: "application/pdf",
          size: 126756,
          uploadedAt: new Date("2026-06-14T01:19:54.183Z"),
        },
      ],
      status: "rejected",
      internalNote: null,
      createdAt: new Date("2026-06-14T01:19:54.193Z"),
      updatedAt: new Date("2026-06-14T01:21:52.250Z"),
    },
  ];

  for (const offer of offers) {
    await PropertyOffer.findOneAndUpdate(
      {
        email: offer.email,
        city: offer.city,
        address: offer.address,
        createdAt: offer.createdAt,
      },
      offer,
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    console.log(`Property offer seeded: ${offer.firstName} ${offer.lastName}`);
  }
};

const seedProperties = async () => {
  const properties = loadJsonData<any[]>("data/properties.json");

  for (const property of properties) {
    delete property._id;
    delete property.__v;

    await Property.findOneAndUpdate(
      { publicId: property.publicId },
      property,
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    console.log(`Property seeded: ${property.title}`);
  }
};

const runSeed = async () => {
  await connectDB();

  await seedAdmin();
  await seedProperties();
  await seedNewsletterSubscribers();
  await seedAssistantInquiries();
  await seedPropertyOffers();

  await mongoose.disconnect();
  console.log("Atlas seed completed successfully.");
};

runSeed().catch(async (error) => {
  console.error("Atlas seed failed:");
  console.error(error);

  await mongoose.disconnect();
  process.exit(1);
});