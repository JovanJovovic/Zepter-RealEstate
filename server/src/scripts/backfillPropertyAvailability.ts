import dotenv from "dotenv";
import mongoose from "mongoose";

import { connectDB } from "../config/db.js";
import Property from "../models/Property.js";
import {
  DEFAULT_OCCUPANCY_PERCENTAGE,
  buildAvailabilityFields,
} from "../utils/propertyAvailability.js";

dotenv.config();

const backfillPropertyAvailability = async () => {
  await connectDB();

  const properties = await Property.find();
  let updatedCount = 0;

  for (const property of properties) {
    const availability = buildAvailabilityFields(
      property.sizeSqm,
      property.occupancyPercentage ?? DEFAULT_OCCUPANCY_PERCENTAGE
    );

    if (
      property.occupancyPercentage !== availability.occupancyPercentage ||
      property.availableArea !== availability.availableArea
    ) {
      property.occupancyPercentage = availability.occupancyPercentage;
      property.availableArea = availability.availableArea;
      await property.save();
      updatedCount += 1;
    }
  }

  await mongoose.disconnect();

  console.log(`Property availability backfill completed. Updated ${updatedCount} properties.`);
};

backfillPropertyAvailability().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
