import { Router } from "express";

import { createPropertyOffer } from "../controllers/propertyOffer.controller.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

router.post(
  "/",
  upload.fields([
    { name: "images", maxCount: 12 },
    { name: "floorPlans", maxCount: 5 },
    { name: "documents", maxCount: 8 },
  ]),
  createPropertyOffer
);

export default router;
