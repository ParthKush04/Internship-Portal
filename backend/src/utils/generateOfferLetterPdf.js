import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from 'url';
import { offerLetterTemplate } from "./offerLetterTemplate.js";
import { generateOfferLetter } from "./generateOfferLetter.js";
import { generateOfferLetterFromTemplate } from "./generateOfferLetterFromTemplate.js";
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
    // Prefer repository uploads folder, then fall back to OS temp directory.
    const backendDir = path.resolve(__dirname, "..", "..");
    const preferredOfferLetterDir = path.join(backendDir, "uploads", "offer-letters");
    let offerLetterDir = preferredOfferLetterDir;
    
    console.log("Backend directory:", backendDir);
    console.log("Preferred offer letter save directory:", offerLetterDir);
    
    try {
      fs.mkdirSync(offerLetterDir, { recursive: true });
      console.log("Offer letter directory is ready");
    } catch (dirError) {
      const fallbackDir = path.join(os.tmpdir(), "provisioning-tech", "offer-letters");
      fs.mkdirSync(fallbackDir, { recursive: true });
      offerLetterDir = fallbackDir;
      console.warn("Falling back to temp directory for offer letters:", fallbackDir, "Reason:", dirError.message);
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

    // Primary path: use the same multi-page PDF template layout as the reference project.
    // Fallbacks are kept for resilience when template loading fails.
    let pdfBuffer;
    try {
      const templatePdfBytes = await generateOfferLetterFromTemplate({
        refNo: refNumber,
        studentName: templateData.name,
        role: templateData.internshipType,
        startDate,
        duration,
        address: "Provisioning Tech",
        email: "",
        mobile: ""
      });
      pdfBuffer = Buffer.from(templatePdfBytes);
    } catch (templateError) {
      console.warn("Template-based offer letter generation failed, trying HTML/Puppeteer:", templateError.message);
      try {
        const html = offerLetterTemplate(templateData);
        pdfBuffer = await generatePdf(html);
      } catch (pdfError) {
        console.warn("Puppeteer offer letter generation failed, using PDFKit fallback:", pdfError.message);
        pdfBuffer = await generateOfferLetter({
          name: templateData.name,
          internshipType: templateData.internshipType,
          startDate: templateData.startDate,
          duration: templateData.duration
        });
      }
    }

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
