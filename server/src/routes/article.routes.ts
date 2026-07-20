import { Router } from "express";

import {
  getBlogArticle,
  getBlogArticles,
  getNewsArticle,
  getNewsArticles,
} from "../controllers/article.controller.js";

const router = Router();

router.get("/blog", getBlogArticles);
router.get("/blog/:slug", getBlogArticle);
router.get("/news", getNewsArticles);
router.get("/news/:slug", getNewsArticle);

export default router;
