import dotenv from "dotenv";
import fs from "fs";
import mongoose from "mongoose";
import path from "path";

import { connectDB } from "../config/db.js";
import Article, { type ArticleType } from "../models/Article.js";
import {
  findArticleMedia,
  persistArticleMedia,
} from "../services/articleMedia.service.js";

dotenv.config();

const mimeTypes: Record<string, string> = {
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

const uploadsRoots = [
  path.join(process.cwd(), "uploads"),
  path.join(process.cwd(), "server", "uploads"),
];

const findLocalFile = (type: ArticleType, filename: string) => (
  uploadsRoots
    .map((root) => path.join(root, type, filename))
    .find((candidate) => fs.existsSync(candidate))
);

const parseArticleMediaPath = (value: string, articleType: ArticleType) => {
  const match = value.match(/^\/uploads\/(blog|news)\/([^/?#]+)$/i);

  if (!match || match[1].toLowerCase() !== articleType) {
    return null;
  }

  return decodeURIComponent(match[2]);
};

const run = async () => {
  await connectDB();

  const articles = await Article.find().select("type slug coverImage galleryImages").lean();
  let uploaded = 0;
  let alreadyStored = 0;
  const missing: string[] = [];

  for (const article of articles) {
    const values = [article.coverImage, ...(article.galleryImages || [])].filter(Boolean) as string[];

    for (const value of values) {
      const filename = parseArticleMediaPath(value, article.type);

      if (!filename) {
        continue;
      }

      if (await findArticleMedia(filename, article.type)) {
        alreadyStored += 1;
        continue;
      }

      const localPath = findLocalFile(article.type, filename);

      if (!localPath) {
        missing.push(`${article.type}:${article.slug} -> ${value}`);
        continue;
      }

      const stats = fs.statSync(localPath);
      const extension = path.extname(filename).toLowerCase();

      await persistArticleMedia(
        {
          filename,
          originalname: filename,
          mimetype: mimeTypes[extension] || "application/octet-stream",
          size: stats.size,
          path: localPath,
        },
        article.type
      );
      uploaded += 1;
    }
  }

  console.log(`Article media uploaded to GridFS: ${uploaded}`);
  console.log(`Article media already in GridFS: ${alreadyStored}`);
  console.log(`Missing local article media: ${missing.length}`);
  missing.forEach((entry) => console.log(`MISSING ${entry}`));
};

run()
  .catch((error) => {
    console.error("Article GridFS migration failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });

