import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { generatePdf } from "./generatePdf.js";
import weeklyReportTemplate from "../templates/weeklyReportTemplate.js";
import { generateWeeklyReport } from "./generateWeeklyReport.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateWeeklyReportPdf = async (applicationId) => {
  try {
    const reportData = await generateWeeklyReport(applicationId);
    const backendDir = path.resolve(__dirname, "..", "..");
    const reportDir = path.join(backendDir, "uploads", "weekly-reports");

    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const studentId = reportData?.application?.studentId?.id || applicationId;
    const fileName = `weekly-report-${studentId}-${Date.now()}.pdf`;
    const absoluteFilePath = path.join(reportDir, fileName);
    const relativeFilePath = `/uploads/weekly-reports/${fileName}`;

    const html = weeklyReportTemplate(reportData);
    const pdfBuffer = await generatePdf(html);

    fs.writeFileSync(absoluteFilePath, pdfBuffer);

    return {
      fileName,
      absoluteFilePath,
      relativeFilePath,
      pdfBuffer,
      reportData,
      success: true
    };
  } catch (error) {
    console.error("Error generating weekly report PDF:", error);
    throw new Error(`Failed to generate weekly report PDF: ${error.message}`);
  }
};

export default generateWeeklyReportPdf;