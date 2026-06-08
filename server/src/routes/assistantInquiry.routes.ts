import { Router } from "express";

import { createAssistantInquiry } from "../controllers/assistantInquiry.controller.js";

const router = Router();

router.post("/", createAssistantInquiry);

export default router;
