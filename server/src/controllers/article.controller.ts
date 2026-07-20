import type { Request, Response } from "express";

import Article, { type ArticleType, type IArticle } from "../models/Article.js";

const resolveLanguage = (value: unknown) => (String(value || "sr").toLowerCase() === "sr" ? "sr" : "en");

const localizeArticle = (article: IArticle, language: "sr" | "en") => {
  const useSerbian = language === "sr";

  return {
    _id: article._id,
    type: article.type,
    slug: article.slug,
    title: useSerbian ? article.titleSr : article.titleEn || article.titleSr,
    excerpt: useSerbian ? article.excerptSr : article.excerptEn || article.excerptSr,
    content: useSerbian ? article.contentSr : article.contentEn || article.contentSr,
    coverImage: article.coverImage,
    galleryImages: article.galleryImages,
    category: article.category,
    author: article.author,
    publishedAt: article.publishedAt,
    featured: article.featured,
    videoUrl: article.videoUrl,
    metaTitle: article.metaTitle,
    metaDescription: article.metaDescription,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
  };
};

const publishedFilter = (type: ArticleType) => ({
  type,
  status: "published",
  publishedAt: { $lte: new Date() },
});

const listPublishedArticles = (type: ArticleType) => async (req: Request, res: Response) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 50);
  const skip = (page - 1) * limit;
  const filter = publishedFilter(type);
  const language = resolveLanguage(req.query.language);

  const [items, total] = await Promise.all([
    Article.find(filter)
      .sort({ featured: -1, publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Article.countDocuments(filter),
  ]);

  res.json({
    items: items.map((article) => localizeArticle(article, language)),
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
};

const getPublishedArticle = (type: ArticleType) => async (req: Request, res: Response) => {
  const article = await Article.findOne({
    ...publishedFilter(type),
    slug: req.params.slug,
  });

  if (!article) {
    return res.status(404).json({ message: "Sadržaj nije pronađen." });
  }

  res.json(localizeArticle(article, resolveLanguage(req.query.language)));
};

export const getBlogArticles = listPublishedArticles("blog");
export const getBlogArticle = getPublishedArticle("blog");
export const getNewsArticles = listPublishedArticles("news");
export const getNewsArticle = getPublishedArticle("news");
