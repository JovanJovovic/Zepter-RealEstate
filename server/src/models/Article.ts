import mongoose, { Document, Schema } from "mongoose";

import { slugifyText } from "../utils/slugifyText.js";

export type ArticleType = "blog" | "news";
export type ArticleStatus = "draft" | "published" | "archived";

export interface IArticle extends Document {
  type: ArticleType;
  titleSr: string;
  titleEn: string;
  slug: string;
  excerptSr: string;
  excerptEn: string;
  contentSr: string;
  contentEn: string;
  coverImage?: string;
  galleryImages: string[];
  category?: string;
  author?: string;
  publishedAt?: Date;
  status: ArticleStatus;
  featured: boolean;
  videoUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const articleSchema = new Schema<IArticle>(
  {
    type: {
      type: String,
      enum: ["blog", "news"],
      required: true,
      index: true,
    },
    titleSr: { type: String, required: true, trim: true },
    titleEn: { type: String, trim: true, default: "" },
    slug: { type: String, required: true, trim: true, lowercase: true },
    excerptSr: { type: String, trim: true, default: "" },
    excerptEn: { type: String, trim: true, default: "" },
    contentSr: { type: String, required: true, trim: true },
    contentEn: { type: String, trim: true, default: "" },
    coverImage: { type: String, trim: true, default: "" },
    galleryImages: { type: [String], default: [] },
    category: { type: String, trim: true, default: "" },
    author: { type: String, trim: true, default: "" },
    publishedAt: { type: Date },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },
    featured: { type: Boolean, default: false },
    videoUrl: { type: String, trim: true, default: "" },
    metaTitle: { type: String, trim: true, default: "" },
    metaDescription: { type: String, trim: true, default: "" },
  },
  {
    timestamps: true,
  }
);

articleSchema.pre("validate", function () {
  this.slug = slugifyText(this.slug || this.titleSr);

  if (this.status === "published" && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

articleSchema.index({ slug: 1 }, { unique: true });
articleSchema.index({ type: 1, status: 1, featured: -1, publishedAt: -1 });

const Article = mongoose.model<IArticle>("Article", articleSchema);

export default Article;
