import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import certificateTemplate from "../templates/certificateTemplate.js";
import { generatePdf } from "./generatePdf.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const formatDate = (dateValue) => {
  const date = new Date(dateValue || new Date());
  if (Number.isNaN(date.getTime())) {
    return "01/01/2026";
  }
  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric"
  });
};

export const generateCertificatePdf = async ({
  studentId,
  studentName,
  internshipType,
  startDate,
  endDate,
  companyName = "Provisioning Tech",
  companyTagline = "Complete IT Solution"
}) => {
  try {
    const certificateDir = path.resolve("backend", "uploads", "certificates");
    if (!fs.existsSync(certificateDir)) {
      fs.mkdirSync(certificateDir, { recursive: true });
    }

    const fileName = `certificate-${studentId}-${Date.now()}.pdf`;
    const absoluteFilePath = path.join(certificateDir, fileName);
    const relativeFilePath = `/uploads/certificates/${fileName}`;

    // Generate certificate number
    const year = new Date().getFullYear();
    const certificateNumber = `CERT/${year}/${String(studentId).padStart(3, '0')}`;

    // Format dates
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);

    // Generate HTML from template
    const html = certificateTemplate({
      studentName: studentName || "Student Name",
      internshipType: internshipType || "Internship Program",
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      certificateNumber: certificateNumber,
      companyName: companyName,
      companyTagline: companyTagline
    });

    // Convert HTML to PDF using Puppeteer
    const pdfBuffer = await generatePdf(html);

    // Write PDF file
    fs.writeFileSync(absoluteFilePath, pdfBuffer);

    console.log("Certificate PDF generated:", relativeFilePath);

    return {
      fileName,
      absoluteFilePath,
      relativeFilePath,
      success: true
    };
  } catch (error) {
    console.error("Error generating certificate PDF:", error);
    throw error;
  }
};

export default generateCertificatePdf;
