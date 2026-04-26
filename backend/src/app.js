import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import healthRouter from "./routes/health.js";
import authRouter from "./routes/auth.js";
import applicationRouter from "./routes/application.js";
import internshipRouter from "./routes/internship.js";
import pdfRouter from "./routes/pdf.js";
import weeklyLogsRouter from "./routes/weeklyLogs.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import path from "path";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.json({ message: "Internship Application and Management API" });
});

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/applications", applicationRouter);
app.use("/api/internships", internshipRouter);
app.use("/api/pdf", pdfRouter);
app.use("/api/weekly-logs", weeklyLogsRouter);
app.use("/uploads", express.static(path.resolve("backend", "uploads")));

app.use(notFound);
app.use(errorHandler);

export default app;
