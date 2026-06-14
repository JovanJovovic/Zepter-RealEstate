import { Router } from "express";

import {
  getPropertyOfferById,
  getPropertyOffers,
  updatePropertyOfferInternalNote,
  updatePropertyOfferStatus,
} from "../../controllers/admin/adminPropertyOffer.controller.js";
import { protectAdmin } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(protectAdmin);

router.get("/", getPropertyOffers);
router.get("/:id", getPropertyOfferById);
router.patch("/:id/status", updatePropertyOfferStatus);
router.patch("/:id/internal-note", updatePropertyOfferInternalNote);

export default router;
