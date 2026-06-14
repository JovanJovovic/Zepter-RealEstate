import { Router } from "express";
import type { Request, Response } from "express";

import { protectAdmin } from "../../middlewares/auth.middleware.js";
import { upload } from "../../middlewares/upload.middleware.js";

const router = Router();

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
