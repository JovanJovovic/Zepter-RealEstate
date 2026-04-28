import { Router } from "express";

import {
  createProperty,
  deleteProperty,
  getAdminProperties,
  getAdminPropertyById,
  updateProperty,
} from "../../controllers/admin/adminProperty.controller.js";
import { protectAdmin } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(protectAdmin);

router.get("/", getAdminProperties);
router.get("/:id", getAdminPropertyById);
router.post("/", createProperty);
router.put("/:id", updateProperty);
router.delete("/:id", deleteProperty);

export default router;