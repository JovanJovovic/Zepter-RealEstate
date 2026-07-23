import multer from "multer";
import type { Request } from "express";
import type { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";

const uploadsDir = path.join(process.cwd(), "uploads");
const articleUploadTypes = ["blog", "news"] as const;

fs.mkdirSync(uploadsDir, { recursive: true });
articleUploadTypes.forEach((type) => {
  fs.mkdirSync(path.join(uploadsDir, type), { recursive: true });
});

const allowedMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];

const allowedImageMimeTypes = allowedMimeTypes.filter((mimeType) => mimeType !== "application/pdf");

const createFilename = (
  file: Express.Multer.File,
  cb: (error: Error | null, filename: string) => void
) => {
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1e9);
  const extension = path.extname(file.originalname).toLowerCase();
  const baseName = path
    .basename(file.originalname, extension)
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-_]/g, "")
    .toLowerCase();

  cb(null, `${timestamp}-${random}-${baseName || "image"}${extension}`);
};

const storage = multer.diskStorage({
  destination: (
    _req: Request,
    _file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => createFilename(file, cb),
});

const articleStorage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const articleType = String(req.params.type || "");

    if (!articleUploadTypes.includes(articleType as (typeof articleUploadTypes)[number])) {
      cb(new Error("Tip sadržaja za upload mora biti blog ili news."), uploadsDir);
      return;
    }

    const destination = path.join(uploadsDir, articleType);
    fs.mkdirSync(destination, { recursive: true });
    cb(null, destination);
  },
  filename: (_req, file, cb) => createFilename(file, cb),
});

const createFileFilter = (mimeTypes: string[], errorMessage: string) => (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (!mimeTypes.includes(file.mimetype)) {
    cb(new Error(errorMessage));
    return;
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter: createFileFilter(
    allowedMimeTypes,
    "Dozvoljeni su samo image fajlovi i PDF dokumenti."
  ),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

export const articleUpload = multer({
  storage: articleStorage,
  fileFilter: createFileFilter(
    allowedImageMimeTypes,
    "Dozvoljeni su samo JPG, PNG, WebP i GIF image fajlovi."
  ),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});
