import { Router } from "express";
import type { Request, Response } from "express";

import { protectAdmin } from "../../middlewares/auth.middleware.js";
import { articleUpload, upload } from "../../middlewares/upload.middleware.js";

const router = Router();
const ARTICLE_TYPES = ["blog", "news"] as const;

const isArticleType = (value: string) => (
  ARTICLE_TYPES.includes(value as (typeof ARTICLE_TYPES)[number])
);

const articleUploadPath = (req: Request, filename: string) => (
  `/uploads/${req.params.type}/${filename}`
);

router.post(
  "/article/:type/single",
  protectAdmin,
  (req: Request, res: Response, next) => {
    if (!isArticleType(String(req.params.type))) {
      return res.status(400).json({ message: "Tip sadržaja mora biti blog ili news." });
    }

    next();
  },
  articleUpload.single("file"),
  (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({
        message: "Slika nije poslata.",
      });
    }

    res.status(201).json({
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: articleUploadPath(req, req.file.filename),
      },
    });
  }
);

router.post(
  "/article/:type/multiple",
  protectAdmin,
  (req: Request, res: Response, next) => {
    if (!isArticleType(String(req.params.type))) {
      return res.status(400).json({ message: "Tip sadržaja mora biti blog ili news." });
    }

    next();
  },
  articleUpload.array("files", 20),
  (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      return res.status(400).json({
        message: "Slike nisu poslate.",
      });
    }

    res.status(201).json({
      files: files.map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: articleUploadPath(req, file.filename),
      })),
    });
  }
);

router.post(
  "/single",
  protectAdmin,
  upload.single("file"),
  (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({
        message: "Fajl nije poslat.",
      });
    }

    res.status(201).json({
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: `/uploads/${req.file.filename}`,
      },
    });
  }
);

router.post(
  "/multiple",
  protectAdmin,
  upload.array("files", 20),
  (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      return res.status(400).json({
        message: "Fajlovi nisu poslati.",
      });
    }

    res.status(201).json({
      files: files.map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: `/uploads/${file.filename}`,
      })),
    });
  }
);

export default router;
