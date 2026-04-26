import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { offerLetterTemplate } from "./offerLetterTemplate.js";
import { generatePdf } from "./generatePdf.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateOfferLetterPdf = async ({ 
  studentId, 
  studentName, 
  role, 
  startDate, 
  duration, 
  hrContactName = "Parth Kushwaha",
  hrContactEmail = "parthkush1000@gmail.com",
  hrContactPhone = "+91- 9044775397"
}) => {
  try {
    // Use __dirname to get directory relative to this file (backend/src/utils)
    // Then go up to backend directory: ../.. (utils -> src -> backend)
    const backendDir = path.resolve(__dirname, "..", "..");
    const offerLetterDir = path.join(backendDir, "uploads", "offer-letters");
    
    console.log("Backend directory:", backendDir);
    console.log("Offer letter save directory:", offerLetterDir);
    
    if (!fs.existsSync(offerLetterDir)) {
      fs.mkdirSync(offerLetterDir, { recursive: true });
      console.log("Created offer letter directory");
    }

    const fileName = `offer-letter-${studentId}-${Date.now()}.pdf`;
    const absoluteFilePath = path.join(offerLetterDir, fileName);
    const relativeFilePath = `/uploads/offer-letters/${fileName}`;

    // Format dates - DD/MM/YYYY format
    const startDateObj = new Date(startDate);
    const formattedDate = `${String(startDateObj.getDate()).padStart(2, '0')}/${String(startDateObj.getMonth() + 1).padStart(2, '0')}/${startDateObj.getFullYear()}`;
    
    // Generate reference number
    const refNumber = `HR/INT/${new Date().getFullYear()}/${String(studentId).padStart(3, '0')}`;

    // Extract duration number (remove "Months" if present)
    const durationNumber = typeof duration === 'string' 
      ? duration.replace(/\D/g, '') 
      : duration;

    // HARD DEBUG - Log final data before passing to template
    console.log("==========================================");
    console.log("FINAL DATA BEING SENT TO TEMPLATE:");
    console.log("==========================================");
    console.log("studentName:", studentName);
    console.log("role:", role);
    console.log("formattedDate:", formattedDate);
    console.log("durationNumber:", durationNumber);
    console.log("Input Parameters:");
    console.log({ studentId, studentName, role, startDate, duration, hrContactName, hrContactEmail, hrContactPhone });
    console.log("==========================================");

    // Generate HTML from template with fallback values for testing
    const templateData = {
      name: studentName || "TEST NAME",
      internshipType: role || "TEST ROLE",
      startDate: formattedDate,
      duration: durationNumber || "3",
      refNumber: refNumber,
      hrContactName: hrContactName || "Parth Kushwaha",
      hrContactEmail: hrContactEmail || "parthkush1000@gmail.com",
      hrContactPhone: hrContactPhone || "+91- 9044775397"
    };

    console.log("TEMPLATE DATA OBJECT:", templateData);
    const html = offerLetterTemplate(templateData);

    // Convert HTML to PDF using Puppeteer
    const pdfBuffer = await generatePdf(html);

    // Write PDF file
    fs.writeFileSync(absoluteFilePath, pdfBuffer);

    return {
      fileName,
      absoluteFilePath,
      relativeFilePath,
      pdfBuffer,   // ADD THIS
      success: true
    };
  } catch (error) {
    console.error("Error generating offer letter PDF:", error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
};

export default generateOfferLetterPdf;
