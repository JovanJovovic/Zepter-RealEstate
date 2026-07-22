import dotenv from "dotenv";
import mongoose from "mongoose";

import { connectDB } from "../config/db.js";
import Article from "../models/Article.js";

dotenv.config();

const publicImage = (fileName: string) => `/Zepter Real Estate images/${fileName}`;

const articleImageUpdates = [
  {
    slug: "kako-odabrati-pravi-poslovni-prostor",
    type: "blog",
    coverImage: publicImage("office-services.jpg"),
    galleryImages: [publicImage("office-services2.jpg"), publicImage("office-services3.jpg")],
  },
  {
    slug: "znacaj-lokacije-za-komercijalne-nekretnine",
    type: "blog",
    coverImage: publicImage("portfolio Zepter Real Estate.jpg"),
    galleryImages: [
      publicImage("warehouse-services2.jpg"),
      publicImage("valuation-advirsory-services2.png"),
    ],
  },
  {
    slug: "fleksibilni-kancelarijski-prostori-i-savremeno-poslovanje",
    type: "blog",
    coverImage: publicImage("what we do Zepter Real Estate.jpg"),
    galleryImages: [publicImage("office-services4.jpg"), publicImage("office-services5.jpg")],
  },
  {
    slug: "zepter-real-estate-portfolio-dostupan-za-pregled",
    type: "news",
    coverImage: publicImage("portfolio Zepter Real Estate.jpg"),
    galleryImages: [],
  },
  {
    slug: "nova-funkcionalnost-za-ponudu-nekretnina",
    type: "news",
    coverImage: publicImage("who we are Zepter-Real Estate.jpg"),
    galleryImages: [],
  },
  {
    slug: "digitalna-prezentacija-poslovnih-prostora",
    type: "news",
    coverImage: publicImage("project-management-services.png"),
    galleryImages: [],
  },
] as const;

const fixArticleImagePaths = async () => {
  await connectDB();

  let updatedCount = 0;
  let missingCount = 0;

  for (const article of articleImageUpdates) {
    const result = await Article.updateOne(
      { slug: article.slug, type: article.type },
      {
        $set: {
          coverImage: article.coverImage,
          galleryImages: article.galleryImages,
        },
      },
      { runValidators: true }
    );

    if (result.matchedCount === 0) {
      missingCount += 1;
      console.warn(`Article not found: ${article.type}/${article.slug}`);
      continue;
    }

    updatedCount += result.modifiedCount;
    console.log(`Checked ${article.type}/${article.slug} -> ${article.coverImage}`);
  }

  const [blogCount, newsCount, uploadedPathCount, publicPathCount] = await Promise.all([
    Article.countDocuments({ type: "blog" }),
    Article.countDocuments({ type: "news" }),
    Article.countDocuments({ coverImage: /^\/uploads\// }),
    Article.countDocuments({ coverImage: /^\/Zepter Real Estate images\// }),
  ]);

  console.log(`Article image path fix completed.`);
  console.log(`Modified records: ${updatedCount}`);
  console.log(`Known demo records missing: ${missingCount}`);
  console.log(`Blog records: ${blogCount}`);
  console.log(`News records: ${newsCount}`);
  console.log(`Records still using /uploads cover images: ${uploadedPathCount}`);
  console.log(`Records using public static cover images: ${publicPathCount}`);

  await mongoose.disconnect();
};

fixArticleImagePaths().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
