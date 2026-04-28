import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { connectDB } from "../config/db.js";
import Admin from "../models/Admin.js";

dotenv.config();

const seedAdmin = async () => {
  await connectDB();

  const name = process.env.ADMIN_SEED_NAME || "Zepter Admin";
  const email = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!email || !password) {
    console.error("ADMIN_SEED_EMAIL i ADMIN_SEED_PASSWORD moraju biti definisani u .env fajlu.");
    process.exit(1);
  }

  const existingAdmin = await Admin.findOne({
    email: email.toLowerCase(),
  });

  if (existingAdmin) {
    console.log("Admin već postoji:", email);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await Admin.create({
    name,
    email,
    passwordHash,
    role: "super-admin",
    isActive: true,
  });

  console.log("Admin je uspešno kreiran:", email);

  await mongoose.disconnect();
};

seedAdmin().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});