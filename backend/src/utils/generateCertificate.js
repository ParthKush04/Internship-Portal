import certificateTemplate from "../templates/certificateTemplate.js";
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

    // Convert HTML to PDF using Puppeteer
    console.log("Converting HTML to PDF...");
    const pdfBuffer = await generatePdf(html);

    console.log("Certificate PDF generated successfully, size:", pdfBuffer.length);
    return pdfBuffer;
  } catch (error) {
    console.error("Error generating certificate:", error);
    throw error;
  }
};