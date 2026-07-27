import type { NextFunction, Request, Response } from "express";

import {
  findArticleMedia,
  openArticleMediaDownloadStream,
  type ArticleMediaType,
} from "../services/articleMedia.service.js";

const ARTICLE_MEDIA_TYPES = ["blog", "news"] as const;

const isArticleMediaType = (value: string): value is ArticleMediaType => (
  ARTICLE_MEDIA_TYPES.includes(value as ArticleMediaType)
);

export const serveArticleMedia = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const type = String(req.params.type || "");
  const filename = String(req.params.filename || "");

  if (!isArticleMediaType(type) || !filename) {
    next();
    return;
  }

  try {
    const file = await findArticleMedia(filename, type);

    if (!file) {
      next();
      return;
    }

    const mimeType = typeof file.metadata?.mimeType === "string"
      ? file.metadata.mimeType
      : "application/octet-stream";

    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Length", String(file.length));
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

    const stream = openArticleMediaDownloadStream(file._id);
    stream.once("error", next);
    stream.pipe(res);
  } catch (error) {
    next(error);
  }
};

