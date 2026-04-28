import multer from "multer";
import path from "path";
import fs from "fs";

const uploadsDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const allowedMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    const baseName = path
      .basename(file.originalname, extension)
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-_]/g, "")
      .toLowerCase();

    cb(null, `${timestamp}-${random}-${baseName}${extension}`);
  },
});

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    cb(new Error("Dozvoljeni su samo image fajlovi i PDF dokumenti."));
    return;
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});