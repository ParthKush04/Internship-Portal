import certificateTemplate from "../templates/certificateTemplate.js";
import PDFDocument from "pdfkit";
import { generatePdf } from "./generatePdf.js";

const formatDate = (dateValue) => {
  if (!dateValue) return "01/01/2026";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return "01/01/2026";
  }
  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric"
  });
};

export const generateCertificate = async (data) => {
  try {
    const {
      name = "Student Name",
      studentName = "Student Name", 
      internshipType = "Internship Program",
      startDate,
      endDate,
      issueDate,
      companyName = "Provisioning Tech",
      companyTagline = "Complete IT Solution"
    } = data || {};

    // Handle both 'name' and 'studentName' fields
    const finalStudentName = name || studentName;

    // Generate certificate number
    const certificateNumber = `CERT/${new Date().getFullYear()}/001`;

    // Format dates
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);

    console.log("Generating certificate with data:", { finalStudentName, internshipType, formattedStartDate, formattedEndDate });

    // Generate HTML from template
    const html = certificateTemplate({
      studentName: finalStudentName,
      internshipType: internshipType,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      certificateNumber: certificateNumber,
      companyName: companyName,
      companyTagline: companyTagline
    });

    // Convert HTML to PDF using Puppeteer, then fallback to PDFKit when Chromium is unavailable.
    console.log("Converting HTML to PDF...");
    let pdfBuffer;
    try {
      pdfBuffer = await generatePdf(html);
    } catch (pdfError) {
      console.warn("Puppeteer certificate generation failed, using PDFKit fallback:", pdfError.message);
      pdfBuffer = await new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: "A4", margin: 56 });
        const buffers = [];

        doc.on("data", (chunk) => buffers.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(buffers)));
        doc.on("error", reject);

        doc
          .fontSize(22)
          .text("Provisioning Tech", { align: "center" })
          .moveDown(0.3)
          .fontSize(12)
          .text("Internship Completion Certificate", { align: "center" })
          .moveDown(2);

        doc
          .fontSize(13)
          .text(`This is to certify that ${finalStudentName} has successfully completed the ${internshipType} internship program.`, {
            align: "left",
            lineGap: 4
          })
          .moveDown(1.2)
          .text(`Internship Period: ${formattedStartDate} to ${formattedEndDate}`)
          .moveDown(0.8)
          .text(`Certificate No: ${certificateNumber}`)
          .moveDown(2)
          .text(`Issued by ${companyName}`, { align: "left" })
          .moveDown(0.2)
          .text(companyTagline, { align: "left" });

        doc.end();
      });
    }

    console.log("Certificate PDF generated successfully, size:", pdfBuffer.length);
    return pdfBuffer;
  } catch (error) {
    console.error("Error generating certificate:", error);
    throw error;
  }
};