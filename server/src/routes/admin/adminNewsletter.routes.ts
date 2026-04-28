import { Router } from "express";

import {
  deleteNewsletterSubscriber,
  getNewsletterSubscribers,
  unsubscribeNewsletterSubscriber,
} from "../../controllers/admin/adminNewsletter.controller.js";
import { protectAdmin } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(protectAdmin);

router.get("/", getNewsletterSubscribers);
router.patch("/:id/unsubscribe", unsubscribeNewsletterSubscriber);
router.delete("/:id", deleteNewsletterSubscriber);

export default router;