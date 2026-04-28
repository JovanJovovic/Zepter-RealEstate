import { Router } from "express";

import {
  createProperty,
  deleteProperty,
  getFeaturedProperties,
  getProperties,
  getPropertyByPublicId,
  getPropertyBySlug,
  updateProperty,
} from "../controllers/property.controller.js";
import { protectAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", getProperties);
router.get("/featured", getFeaturedProperties);
router.get("/:publicId", getPropertyByPublicId);
router.get("/:slug", getPropertyBySlug);

router.post("/", protectAdmin, createProperty);
router.put("/:id", protectAdmin, updateProperty);
router.delete("/:id", protectAdmin, deleteProperty);

export default router;