import dotenv from "dotenv";
import fs from "fs";
import mongoose from "mongoose";
import path from "path";

import { connectDB } from "../config/db.js";
import Article, { type ArticleType } from "../models/Article.js";

dotenv.config();

const uploadsRoot = path.join(process.cwd(), "uploads");
const articleFolders: Record<ArticleType, string> = {
  blog: path.join(uploadsRoot, "blog"),
  news: path.join(uploadsRoot, "news"),
};

type MigrationResult = {
  value: string;
  changed: boolean;
  copied: boolean;
  missing: boolean;
};

const decodeFileName = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const migrateLegacyUploadPath = (
  value: string,
  type: ArticleType,
  articleSlug: string,
  field: string
): MigrationResult => {
  const trimmedValue = String(value || "").trim();
  if (!trimmedValue) {
    return { value: trimmedValue, changed: false, copied: false, missing: false };
  }

  const normalized = trimmedValue.replace(/\\/g, "/").split(/[?#]/, 1)[0];

  if (
    normalized.startsWith("/uploads/blog/")
    || normalized.startsWith("/uploads/news/")
    || normalized.startsWith("uploads/blog/")
    || normalized.startsWith("uploads/news/")
  ) {
    return { value: trimmedValue, changed: false, copied: false, missing: false };
  }

  const legacyMatch = normalized.match(/^\/?uploads\/([^/]+)$/i);
  if (!legacyMatch) {
    return { value: trimmedValue, changed: false, copied: false, missing: false };
  }

  const decodedFileName = decodeFileName(legacyMatch[1]);
  const fileName = path.basename(decodedFileName);

  if (!fileName || fileName !== decodedFileName) {
    console.warn(`[MISSING] ${type}/${articleSlug} ${field}: invalid legacy path ${trimmedValue}`);
    return { value: trimmedValue, changed: false, copied: false, missing: true };
  }

  const sourcePath = path.join(uploadsRoot, fileName);
  const targetDirectory = articleFolders[type];
  const targetPath = path.join(targetDirectory, fileName);
  const publicPath = `/uploads/${type}/${encodeURIComponent(fileName)}`;

  fs.mkdirSync(targetDirectory, { recursive: true });

  if (fs.existsSync(targetPath)) {
    console.log(`[FOUND] ${type}/${articleSlug} ${field}: ${publicPath}`);
    return { value: publicPath, changed: true, copied: false, missing: false };
  }

  if (!fs.existsSync(sourcePath)) {
    console.warn(
      `[MISSING] ${type}/${articleSlug} ${field}: ${trimmedValue} `
      + `(expected local file ${sourcePath})`
    );
    return { value: trimmedValue, changed: false, copied: false, missing: true };
  }

  fs.copyFileSync(sourcePath, targetPath);
  console.log(`[COPIED] ${type}/${articleSlug} ${field}: ${trimmedValue} -> ${publicPath}`);

  return { value: publicPath, changed: true, copied: true, missing: false };
};

const migrateArticleUploadFolders = async () => {
  await connectDB();

  fs.mkdirSync(articleFolders.blog, { recursive: true });
  fs.mkdirSync(articleFolders.news, { recursive: true });

  const articles = await Article.find({ type: { $in: ["blog", "news"] } });
  let updatedArticles = 0;
  let updatedPaths = 0;
  let copiedFiles = 0;
  let missingFiles = 0;

  for (const article of articles) {
    const coverResult = migrateLegacyUploadPath(
      article.coverImage || "",
      article.type,
      article.slug,
      "coverImage"
    );
    const galleryResults = article.galleryImages.map((image, index) => (
      migrateLegacyUploadPath(image, article.type, article.slug, `galleryImages[${index}]`)
    ));

    const changed = coverResult.changed || galleryResults.some((result) => result.changed);
    updatedPaths += Number(coverResult.changed)
      + galleryResults.filter((result) => result.changed).length;
    copiedFiles += Number(coverResult.copied)
      + galleryResults.filter((result) => result.copied).length;
    missingFiles += Number(coverResult.missing)
      + galleryResults.filter((result) => result.missing).length;

    if (!changed) continue;

    article.coverImage = coverResult.value;
    article.galleryImages = galleryResults.map((result) => result.value);
    await article.save();
    updatedArticles += 1;
  }

  const [blogUploadPaths, newsUploadPaths, legacyUploadPaths] = await Promise.all([
    Article.countDocuments({
      $or: [
        { coverImage: /^\/uploads\/blog\// },
        { galleryImages: /^\/uploads\/blog\// },
      ],
    }),
    Article.countDocuments({
      $or: [
        { coverImage: /^\/uploads\/news\// },
        { galleryImages: /^\/uploads\/news\// },
      ],
    }),
    Article.countDocuments({
      $or: [
        { coverImage: /^\/uploads\/[^/]+$/ },
        { galleryImages: /^\/uploads\/[^/]+$/ },
      ],
    }),
  ]);

  console.log("");
  console.log("Article upload folder migration completed.");
  console.log(`Articles inspected: ${articles.length}`);
  console.log(`Articles updated: ${updatedArticles}`);
  console.log(`Database paths updated: ${updatedPaths}`);
  console.log(`Files copied into blog/news folders: ${copiedFiles}`);
  console.log(`Missing files requiring manual re-upload: ${missingFiles}`);
  console.log(`Articles using /uploads/blog paths: ${blogUploadPaths}`);
  console.log(`Articles using /uploads/news paths: ${newsUploadPaths}`);
  console.log(`Articles still referencing legacy root upload paths: ${legacyUploadPaths}`);
};

migrateArticleUploadFolders()
  .catch((error) => {
    console.error("Article upload folder migration failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
