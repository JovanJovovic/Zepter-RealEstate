import { Router } from "express";

import {
  getAssistantInquiries,
  updateAssistantInquiryStatus,
} from "../../controllers/admin/adminAssistantInquiry.controller.js";
import { protectAdmin } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(protectAdmin);

router.get("/", getAssistantInquiries);
router.patch("/:id/status", updateAssistantInquiryStatus);

export default router;
