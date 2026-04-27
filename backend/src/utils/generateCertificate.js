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
        const doc = new PDFDocument({ size: "A4", margin: 48 });
        const buffers = [];

        doc.on("data", (chunk) => buffers.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(buffers)));
        doc.on("error", reject);

        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;

        // Decorative outer border
        doc
          .lineWidth(3)
          .strokeColor("#A3271A")
          .rect(24, 24, pageWidth - 48, pageHeight - 48)
          .stroke();

        // Decorative inner border
        doc
          .lineWidth(1.5)
          .strokeColor("#D4AF37")
          .rect(36, 36, pageWidth - 72, pageHeight - 72)
          .stroke();

        // Header band
        doc
          .save()
          .rect(48, 48, pageWidth - 96, 92)
          .fill("#A3271A")
          .restore();

        doc
          .fillColor("#FFFFFF")
          .fontSize(30)
          .font("Helvetica-Bold")
          .text(companyName, 48, 76, { align: "center", width: pageWidth - 96 });

        doc
          .fillColor("#FFDB76")
          .fontSize(12)
          .font("Helvetica-Bold")
          .text(companyTagline, 48, 113, { align: "center", width: pageWidth - 96 });

        doc
          .fillColor("#1F2937")
          .font("Helvetica-Bold")
          .fontSize(36)
          .text("CERTIFICATE", 48, 188, { align: "center", width: pageWidth - 96 });

        doc
          .fillColor("#374151")
          .font("Helvetica")
          .fontSize(14)
          .text("OF INTERNSHIP COMPLETION", 48, 230, { align: "center", width: pageWidth - 96 });

        doc
          .moveTo(pageWidth / 2 - 120, 262)
          .lineTo(pageWidth / 2 + 120, 262)
          .lineWidth(1.5)
          .strokeColor("#D4AF37")
          .stroke();

        doc
          .fillColor("#4B5563")
          .font("Helvetica")
          .fontSize(13)
          .text("This certificate is proudly awarded to", 48, 286, {
            align: "center",
            width: pageWidth - 96
          });

        doc
          .fillColor("#A3271A")
          .font("Helvetica-Bold")
          .fontSize(30)
          .text(finalStudentName, 48, 318, { align: "center", width: pageWidth - 96 });

        doc
          .moveTo(pageWidth / 2 - 180, 356)
          .lineTo(pageWidth / 2 + 180, 356)
          .lineWidth(1)
          .strokeColor("#D1D5DB")
          .stroke();

        doc
          .fillColor("#1F2937")
          .font("Helvetica")
          .fontSize(13)
          .text(
            `for successfully completing the ${internshipType} internship program at ${companyName}.`,
            86,
            384,
            {
              align: "center",
              width: pageWidth - 172,
              lineGap: 4
            }
          );

        doc
          .font("Helvetica-Bold")
          .fontSize(12)
          .fillColor("#111827")
          .text("Internship Period", 100, 470)
          .font("Helvetica")
          .text(`${formattedStartDate} to ${formattedEndDate}`, 238, 470);

        doc
          .font("Helvetica-Bold")
          .text("Certificate No", 100, 496)
          .font("Helvetica")
          .text(certificateNumber, 238, 496);

        doc
          .font("Helvetica-Bold")
          .text("Issue Date", 100, 522)
          .font("Helvetica")
          .text(formatDate(issueDate || new Date()), 238, 522);

        // Signature block
        doc
          .moveTo(pageWidth - 250, 610)
          .lineTo(pageWidth - 90, 610)
          .lineWidth(1)
          .strokeColor("#6B7280")
          .stroke();

        doc
          .font("Helvetica-Bold")
          .fontSize(11)
          .fillColor("#1F2937")
          .text("Authorized Signatory", pageWidth - 250, 616, { width: 160, align: "center" })
          .font("Helvetica")
          .fontSize(10)
          .text(companyName, pageWidth - 250, 632, { width: 160, align: "center" });

        doc
          .font("Helvetica")
          .fontSize(9)
          .fillColor("#6B7280")
          .text("This document is generated electronically by Provisioning Tech.", 48, pageHeight - 62, {
            align: "center",
            width: pageWidth - 96
          });

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