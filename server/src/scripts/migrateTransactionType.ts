import dotenv from "dotenv";
import mongoose from "mongoose";

import { connectDB } from "../config/db.js";
import Property from "../models/Property.js";

dotenv.config();

const saleTargets = [
  {
    publicId: "ZRE-MQ84YMHE-NSRQCJ",
    slug: "zepter-knez-mihailova",
  },
  {
    publicId: "ZRE-MONOBMUZ-7JA6XW",
    slug: "zepter-expo",
  },
];

const migrateTransactionType = async () => {
  await connectDB();

  const missingResult = await Property.updateMany(
    {
      $or: [
        { transactionType: { $exists: false } },
        { transactionType: null },
        { transactionType: "" },
      ],
    },
    { $set: { transactionType: "rent" } }
  );

  const selectedProperties = [];

  for (const target of saleTargets) {
    const property = await Property.findOne({
      $or: [{ publicId: target.publicId }, { slug: target.slug }],
    }).select("_id title publicId slug");

    if (!property) {
      throw new Error(
        `Sale target not found: ${target.publicId} (${target.slug}). Migration stopped before assigning sale values.`
      );
    }

    selectedProperties.push(property);
  }

  const uniqueIds = new Set(selectedProperties.map((property) => String(property._id)));

  if (uniqueIds.size !== 2) {
    throw new Error("Migration must resolve exactly two distinct sale properties.");
  }

  await Property.updateMany(
    { _id: { $in: selectedProperties.map((property) => property._id) } },
    { $set: { transactionType: "sale" } }
  );

  const [rentCount, saleCount, missingCount, invalidCount] = await Promise.all([
    Property.countDocuments({ transactionType: "rent" }),
    Property.countDocuments({ transactionType: "sale" }),
    Property.countDocuments({
      $or: [
        { transactionType: { $exists: false } },
        { transactionType: null },
        { transactionType: "" },
      ],
    }),
    Property.countDocuments({ transactionType: { $nin: ["rent", "sale"] } }),
  ]);

  console.log(`Properties initialized as rent: ${missingResult.modifiedCount}`);
  console.log("Properties marked as sale:");
  selectedProperties.forEach((property) => {
    console.log(`- ${property.title} | ${property.publicId} | ${property.slug}`);
  });
  console.log(`Final rent count: ${rentCount}`);
  console.log(`Final sale count: ${saleCount}`);
  console.log(`Properties still missing transactionType: ${missingCount}`);
  console.log(`Properties with invalid transactionType: ${invalidCount}`);

  if (missingCount !== 0 || invalidCount !== 0) {
    throw new Error("transactionType verification failed after migration.");
  }
};

migrateTransactionType()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
