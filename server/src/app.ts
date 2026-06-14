import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import adminAuthRoutes from "./routes/admin/adminAuth.routes.js";
import propertyRoutes from "./routes/property.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import adminUploadRoutes from "./routes/admin/adminUpload.routes.js";
import adminPropertyRoutes from "./routes/admin/adminProperty.routes.js";
import newsletterRoutes from "./routes/newsletter.routes.js";
import adminNewsletterRoutes from "./routes/admin/adminNewsletter.routes.js";
import assistantInquiryRoutes from "./routes/assistantInquiry.routes.js";
import adminAssistantInquiryRoutes from "./routes/admin/adminAssistantInquiry.routes.js";
import propertyOfferRoutes from "./routes/propertyOffer.routes.js";
import adminPropertyOfferRoutes from "./routes/admin/adminPropertyOffer.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const uploadDirectories = [
  path.join(process.cwd(), "uploads"),
  path.join(process.cwd(), "server", "uploads"),
];

uploadDirectories.forEach((uploadDirectory) => {
  app.use("/uploads", express.static(uploadDirectory));
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "Zepter Real Estate API is running",
  });
});

app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/admin/upload", adminUploadRoutes);
app.use("/api/admin/properties", adminPropertyRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/admin/newsletter", adminNewsletterRoutes);
app.use("/api/assistant-inquiries", assistantInquiryRoutes);
app.use("/api/admin/assistant-inquiries", adminAssistantInquiryRoutes);
app.use("/api/property-offers", propertyOfferRoutes);
app.use("/api/admin/property-offers", adminPropertyOfferRoutes);

app.use(errorHandler);

export default app;
