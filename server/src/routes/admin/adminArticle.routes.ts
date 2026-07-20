import { Router } from "express";

import {
  createAdminArticle,
  deleteAdminArticle,
  getAdminArticleById,
  getAdminArticles,
  updateAdminArticle,
  updateAdminArticleStatus,
} from "../../controllers/admin/adminArticle.controller.js";
import { protectAdmin } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(protectAdmin);
router.get("/", getAdminArticles);
router.get("/:id", getAdminArticleById);
router.post("/", createAdminArticle);
router.patch("/:id/status", updateAdminArticleStatus);
router.patch("/:id", updateAdminArticle);
router.delete("/:id", deleteAdminArticle);

export default router;
