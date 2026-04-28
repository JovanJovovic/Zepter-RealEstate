import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import adminAuthRoutes from "./routes/admin/adminAuth.routes.js";
import propertyRoutes from "./routes/property.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import adminUploadRoutes from "./routes/admin/adminUpload.routes.js";
import adminPropertyRoutes from "./routes/admin/adminProperty.routes.js";



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

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


app.use(errorHandler);

export default app;