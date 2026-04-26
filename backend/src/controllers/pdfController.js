import Application from "../models/Application.js";
import generateOfferLetterPdf from "../utils/generateOfferLetterPdf.js";
import { generateCertificate } from "../utils/generateCertificate.js";
import fs from "fs";

const formatDate = (value) => {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
};

const getDurationInMonths = (durationValue) => {
  if (!durationValue) {
    return "0";
  }

  const match = String(durationValue).match(/\d+/);
  return match ? match[0] : String(durationValue);
};

const getApplicationOrThrow = async (applicationId, res) => {
  const application = await Application.findById(applicationId);
  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  return application;
};

const getOfferLetterPdf = async (req, res, next) => {
  try {
    const application = await getApplicationOrThrow(req.params.id, res);
    const fullName = `${application.firstName || ""} ${application.lastName || ""}`.trim();

    // Generate PDF file
    const pdfResult = await generateOfferLetterPdf({
      studentId: application._id || req.params.id,
      studentName: fullName || "Student",
      role: application.assignedInternship || application.internshipPreference || "Internship",
      startDate: application.startDate || new Date(),
      duration: getDurationInMonths(application.duration)
    });

    // Read the generated PDF file and send it
    const pdfBuffer = fs.readFileSync(pdfResult.absoluteFilePath);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${pdfResult.fileName}`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

const getCertificatePdf = async (req, res, next) => {
  try {
    const application = await getApplicationOrThrow(req.params.id, res);
    const fullName = `${application.firstName || ""} ${application.lastName || ""}`.trim();

    const pdfBuffer = await generateCertificate({
      name: fullName || "Student",
      internshipType: application.assignedInternship || application.internshipPreference || "Internship",
      startDate: formatDate(application.startDate),
      endDate: formatDate(application.endDate)
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=certificate.pdf");
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

export { getCertificatePdf, getOfferLetterPdf };