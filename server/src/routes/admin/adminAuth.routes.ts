import { Router } from "express";

import {
  getCurrentAdmin,
  loginAdmin,
  logoutAdmin,
} from "../../controllers/admin/adminAuth.controller.js";
import { protectAdmin } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/login", loginAdmin);
router.post("/logout", logoutAdmin);
router.get("/me", protectAdmin, getCurrentAdmin);

export default router;