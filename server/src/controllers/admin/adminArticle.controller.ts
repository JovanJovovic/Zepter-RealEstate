import type { Request, Response } from "express";

import Article, { type ArticleStatus, type ArticleType, type IArticle } from "../../models/Article.js";
import { slugifyText } from "../../utils/slugifyText.js";

const ARTICLE_TYPES: ArticleType[] = ["blog", "news"];
const ARTICLE_STATUSES: ArticleStatus[] = ["draft", "published", "archived"];

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeImages = (value: unknown) => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
};

const assignArticleData = (article: IArticle, body: Record<string, unknown>) => {
  const textFields = [
    "titleSr",
    "titleEn",
    "excerptSr",
    "excerptEn",
    "contentSr",
    "contentEn",
    "coverImage",
    "category",
    "author",
    "videoUrl",
    "metaTitle",
    "metaDescription",
  ] as const;

  textFields.forEach((field) => {
    if (body[field] !== undefined) {
      article[field] = String(body[field] ?? "").trim() as never;
    }
  });

  if (body.type !== undefined) article.type = String(body.type) as ArticleType;
  if (body.status !== undefined) article.status = String(body.status) as ArticleStatus;
  if (body.featured !== undefined) article.featured = Boolean(body.featured);
  if (body.galleryImages !== undefined) article.galleryImages = normalizeImages(body.galleryImages);

  if (body.publishedAt !== undefined) {
    article.publishedAt = body.publishedAt ? new Date(String(body.publishedAt)) : undefined;
  }

  const requestedSlug = body.slug === undefined ? article.slug : String(body.slug);
  article.slug = slugifyText(requestedSlug || article.titleSr);
};

const validateArticleInput = (body: Record<string, unknown>) => {
  if (body.type !== undefined && !ARTICLE_TYPES.includes(String(body.type) as ArticleType)) {
    return "Tip sadržaja mora biti blog ili news.";
  }

  if (body.status !== undefined && !ARTICLE_STATUSES.includes(String(body.status) as ArticleStatus)) {
    return "Status sadržaja nije podržan.";
  }

  if (body.publishedAt && Number.isNaN(new Date(String(body.publishedAt)).getTime())) {
    return "Datum objavljivanja nije ispravan.";
  }

  return null;
};

const sendSaveError = (error: unknown, res: Response) => {
  const mongoError = error as { code?: number; name?: string; message?: string };

  if (mongoError.code === 11000) {
    return res.status(409).json({ message: "Članak sa ovim slugom već postoji." });
  }

  if (mongoError.name === "ValidationError") {
    return res.status(400).json({ message: mongoError.message || "Podaci članka nisu ispravni." });
  }

  throw error;
};

export const getAdminArticles = async (req: Request, res: Response) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  const filter: Record<string, unknown> = {};

  if (req.query.type && ARTICLE_TYPES.includes(String(req.query.type) as ArticleType)) {
    filter.type = req.query.type;
  }

  if (req.query.status && ARTICLE_STATUSES.includes(String(req.query.status) as ArticleStatus)) {
    filter.status = req.query.status;
  }

  if (req.query.search) {
    const search = escapeRegex(String(req.query.search).trim());
    filter.$or = [
      { titleSr: { $regex: search, $options: "i" } },
      { titleEn: { $regex: search, $options: "i" } },
      { slug: { $regex: search, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    Article.find(filter)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Article.countDocuments(filter),
  ]);

  res.json({
    items,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  });
};

export const getAdminArticleById = async (req: Request, res: Response) => {
  const article = await Article.findById(req.params.id);

  if (!article) return res.status(404).json({ message: "Sadržaj nije pronađen." });

  res.json(article);
};

export const createAdminArticle = async (req: Request, res: Response) => {
  const body = req.body as Record<string, unknown>;
  const validationMessage = validateArticleInput(body);
  if (validationMessage) return res.status(400).json({ message: validationMessage });

  const article = new Article({
    type: body.type || "blog",
    titleSr: body.titleSr,
    contentSr: body.contentSr,
    status: body.status || "draft",
    galleryImages: [],
  });
  assignArticleData(article, body);

  try {
    await article.save();
    res.status(201).json(article);
  } catch (error) {
    return sendSaveError(error, res);
  }
};

export const updateAdminArticle = async (req: Request, res: Response) => {
  const body = req.body as Record<string, unknown>;
  const validationMessage = validateArticleInput(body);
  if (validationMessage) return res.status(400).json({ message: validationMessage });

  const article = await Article.findById(req.params.id);
  if (!article) return res.status(404).json({ message: "Sadržaj nije pronađen." });

  assignArticleData(article, body);

  try {
    await article.save();
    res.json(article);
  } catch (error) {
    return sendSaveError(error, res);
  }
};

export const deleteAdminArticle = async (req: Request, res: Response) => {
  const article = await Article.findByIdAndDelete(req.params.id);
  if (!article) return res.status(404).json({ message: "Sadržaj nije pronađen." });

  res.json({ message: "Sadržaj je obrisan." });
};

export const updateAdminArticleStatus = async (req: Request, res: Response) => {
  const status = String(req.body.status) as ArticleStatus;
  if (!ARTICLE_STATUSES.includes(status)) {
    return res.status(400).json({ message: "Status sadržaja nije podržan." });
  }

  const article = await Article.findById(req.params.id);
  if (!article) return res.status(404).json({ message: "Sadržaj nije pronađen." });

  article.status = status;
  if (status === "published" && !article.publishedAt) article.publishedAt = new Date();
  await article.save();

  res.json(article);
};
