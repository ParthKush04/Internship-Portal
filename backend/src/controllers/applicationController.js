import Application from "../models/Application.js";
import OfferLetter from "../models/OfferLetter.js";
import Certificate from "../models/Certificate.js";
import User from "../models/User.js";
import Internship from "../models/Internship.js";
import { generateOfferLetterPdf } from "../utils/generateOfferLetterPdf.js";
import { generateCertificate } from "../utils/generateCertificate.js";
import sendOfferLetterEmail from "../utils/sendOfferLetterEmail.js";
import sendCertificateEmail from "../utils/sendCertificateEmail.js";
import sendCancellationEmail from "../utils/sendCancellationEmail.js";

// Helper functions for internship creation
const calculateEndDate = (startDate, duration) => {
  const start = new Date(startDate);
  const durationStr = duration.toString().toLowerCase().trim();

  // Extract number and unit from duration string
  const match = durationStr.match(/^(\d+)\s*(day|days|week|weeks|month|months)$/);

  if (!match) {
    throw new Error("Duration format invalid. Use format like '3 months', '12 weeks', '90 days'");
  }

  const amount = parseInt(match[1]);
  const unit = match[2];

  const endDate = new Date(start);

  if (unit.startsWith('day')) {
    endDate.setDate(endDate.getDate() + amount);
  } else if (unit.startsWith('week')) {
    endDate.setDate(endDate.getDate() + (amount * 7));
  } else if (unit.startsWith('month')) {
    endDate.setMonth(endDate.getMonth() + amount);
  }

  return endDate;
};

const parseDurationToDays = (duration) => {
  if (typeof duration === "number" && Number.isFinite(duration) && duration > 0) {
    return Math.floor(duration);
  }

  if (typeof duration !== "string") {
    throw new Error("duration must be a positive number or string like '3 months'");
  }

  const value = duration.trim().toLowerCase();
  const match = value.match(/^(\d+)\s*(day|days|week|weeks|month|months)$/);
  if (!match) {
    throw new Error("duration format is invalid");
  }

  const amount = Number(match[1]);
  const unit = match[2];
  if (unit.startsWith("day")) {
    return amount;
  }
  if (unit.startsWith("week")) {
    return amount * 7;
  }
  return amount * 30;
};

const formatDuration = (duration) => {
  if (typeof duration === "number") {
    return `${Math.floor(duration)} days`;
  }
  return duration.trim();
};

const addDays = (dateInput, days) => {
  const date = new Date(dateInput);
  date.setDate(date.getDate() + days);
  return date;
};

const triggerOfferLetterGeneration = async (application, startDate, duration, endDate) => {
  const studentId = application.studentId;
  const existingOfferLetter = await OfferLetter.findOne({ studentId });
  const studentName = `${application.firstName} ${application.lastName}`;
  const assignedInternshipRole = application.assignedInternship || "Internship";
  let offerLetter = existingOfferLetter;
  if (!offerLetter) {
    const role = `${assignedInternshipRole} Intern`;
    const pdfResult = await generateOfferLetterPdf({
      studentId,
      studentName,
      role,
      startDate,
      duration,
      endDate
    });

    const fileUrl = pdfResult.relativeFilePath;

    offerLetter = await OfferLetter.create({
      studentId,
      fileUrl
    });
  }

  const student = await User.findById(studentId).select("email");
  if (!student) {
    throw new Error("Student not found for offer letter email");
  }

  // Send email 
  console.log("Sending offer letter email to:", student.email);
  console.log("Using file URL:", offerLetter.fileUrl);
  await sendOfferLetterEmail({
    to: student.email,
    studentName,
    fileUrl: offerLetter.fileUrl,
    startDate,
    duration,
    assignedInternship: application.assignedInternship || "Internship"
  });
  console.log("Offer letter email sent successfully to:", student.email);

  return offerLetter;
};

const submitApplication = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      college,
      contactDetails,
      email,
      phone,
      skills,
      internshipPreference
    } = req.body;

    if (process.env.NODE_ENV !== "production") {
      console.log("Application body:", req.body);
      console.log("Application file:", req.file);
    }

    if (!firstName || !lastName || !college || !internshipPreference) {
      res.status(400);
      throw new Error("firstName, lastName, college and internshipPreference are required");
    }

    if (!req.file) {
      res.status(400);
      throw new Error("Resume required");
    }

    let parsedContactDetails = {};

    if (contactDetails) {
      try {
        parsedContactDetails =
          typeof contactDetails === "string" ? JSON.parse(contactDetails) : contactDetails;
      } catch (_error) {
        res.status(400);
        throw new Error("Invalid contactDetails format");
      }
    }

    if (!parsedContactDetails?.email && email) {
      parsedContactDetails.email = email;
    }
    if (!parsedContactDetails?.phone && phone) {
      parsedContactDetails.phone = phone;
    }

    if (!parsedContactDetails?.email || !parsedContactDetails?.phone) {
      res.status(400);
      throw new Error("email and phone are required");
    }

    const parsedSkills =
      typeof skills === "string" ? skills.split(",").map((item) => item.trim()).filter(Boolean) : skills || [];

    const resumeUrl = req.file?.path || req.file?.secure_url;
    if (!resumeUrl) {
      res.status(500);
      throw new Error("Resume upload failed");
    }

    // Check if user already has an active internship
    const existingActive = await Application.findOne({
      studentId: req.user._id,
      status: { $in: ["shortlisted", "ongoing"] }
    });

    if (existingActive) {
      res.status(400);
      throw new Error("You already have an active internship. Complete it before applying again.");
    }

    const application = await Application.create({
      studentId: req.user._id,
      firstName,
      lastName,
      college,
      contactDetails: parsedContactDetails,
      skills: parsedSkills,
      internshipPreference,
      resume: resumeUrl
    });

    res.status(201).json({
      message: "Application submitted successfully",
      application
    });
  } catch (error) {
    next(error);
  }
};

const getAllApplications = async (_req, res, next) => {
  try {
    const applications = await Application.find()
      .populate("studentId", "name email role")
      .sort({ createdAt: -1 });

    try {
      const studentIds = applications
        .map((application) => application.studentId?._id || application.studentId)
        .filter(Boolean);

      const internships = await Internship.find({ studentId: { $in: studentIds } })
        .sort({ createdAt: -1 });

      const latestInternshipByStudent = new Map();
      internships.forEach((internship) => {
        const key = String(internship.studentId);
        if (!latestInternshipByStudent.has(key)) {
          latestInternshipByStudent.set(key, internship);
        }
      });

      const applicationsWithInternship = applications.map((application) => {
        const studentId = String(application.studentId?._id || application.studentId || "");
        const internship = latestInternshipByStudent.get(studentId);
        const applicationObject = application.toObject();

        return {
          ...applicationObject,
          internship: internship
            ? {
                startDate: internship.startDate,
                duration: internship.duration,
                endDate: internship.endDate,
                status: internship.status
              }
            : null
        };
      });

      res.json(applicationsWithInternship);
    } catch (_enrichmentError) {
      // Do not block admin list loading if internship enrichment fails.
      res.json(applications.map((application) => ({ ...application.toObject(), internship: null })));
    }
  } catch (error) {
    next(error);
  }
};

const getSingleApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id).populate(
      "studentId",
      "name email role"
    );
    if (!application) {
      res.status(404);
      throw new Error("Application not found");
    }

    const internship = await Internship.findOne({ studentId: application.studentId?._id || application.studentId }).sort({ createdAt: -1 });
    const certificate = await Certificate.findOne({ studentId: application.studentId?._id || application.studentId }).sort({ createdAt: -1 });

    res.json({
      ...application.toObject(),
      internship: internship
        ? {
            startDate: internship.startDate,
            duration: internship.duration,
            endDate: internship.endDate,
            status: internship.status
          }
        : {
            startDate: application.startDate || null,
            duration: application.duration || null,
            endDate: application.endDate || null,
            status: null
          },
      certificateUrl: certificate?.fileUrl || null
    });
  } catch (error) {
    next(error);
  }
};

const getMyApplicationStatus = async (req, res, next) => {
  try {
    const application = await Application.findOne({ studentId: req.user._id }).sort({ createdAt: -1 });
    if (!application) {
      res.json({ status: null });
      return;
    }
    res.json({ status: application.status, applicationId: application._id });
  } catch (error) {
    next(error);
  }
};

const getMyActiveApplication = async (req, res, next) => {
  try {
    const activeApplication = await Application.findOne({
      studentId: req.user._id,
      status: { $in: ["shortlisted", "ongoing"] }
    });

    if (!activeApplication) {
      res.json({ hasActive: false, application: null });
      return;
    }

    res.json({ hasActive: true, application: activeApplication });
  } catch (error) {
    next(error);
  }
};

const getMyApplication = async (req, res, next) => {
  try {
    const application = await Application.findOne({ studentId: req.user._id }).sort({ createdAt: -1 });

    if (!application) {
      res.json({
        status: null,
        internship: null
      });
      return;
    }

    const internship = await Internship.findOne({ studentId: req.user._id }).sort({ createdAt: -1 });
    const certificate = await Certificate.findOne({ studentId: req.user._id }).sort({ createdAt: -1 });

    res.json({
      applicationId: application._id,
      status: application.status,
      cancelReason: application.cancelReason || null,
      cancelledAt: application.cancelledAt || null,
      assignedInternship: application.assignedInternship || null,
      internship: internship
        ? {
            startDate: internship.startDate,
            duration: internship.duration,
            endDate: internship.endDate,
            status: internship.status
          }
        : {
            startDate: null,
            duration: null,
            endDate: null,
            status: null
          },
      certificateUrl: certificate?.fileUrl || null
    });
  } catch (error) {
    next(error);
  }
};

const shortlistCandidate = async (req, res, next) => {
  try {
    const { applicationId, startDate, duration, assignedInternship } = req.body;
    const targetApplicationId = req.params.id || applicationId;

    console.log("========== SHORTLIST REQUEST ==========");
    console.log("Application ID:", targetApplicationId);
    console.log("Start Date:", startDate);
    console.log("Duration:", duration);
    console.log("Assigned Internship:", assignedInternship);

    // STEP 1: Validate input
    if (!targetApplicationId) {
      return res.status(400).json({ message: "applicationId is required" });
    }

    if (!startDate || !duration || !assignedInternship) {
      return res.status(400).json({ 
        message: "startDate, duration, and assignedInternship are required" 
      });
    }

    // STEP 2: Find application
    const application = await Application.findById(targetApplicationId).populate("studentId", "name email");
    
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (!application.studentId) {
      return res.status(404).json({ message: "Student data not found" });
    }

    const student = application.studentId;
    console.log("Student:", student.name, "Email:", student.email);

    // STEP 3: Calculate end date
    let calculatedEndDate;
    try {
      calculatedEndDate = calculateEndDate(startDate, duration);
      if (Number.isNaN(calculatedEndDate.getTime())) {
        return res.status(400).json({ message: "Invalid start date" });
      }
      console.log("Calculated End Date:", calculatedEndDate);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    // STEP 4: Update application with shortlist details
    console.log("========== UPDATING APPLICATION ==========");
    application.status = "shortlisted";
    application.startDate = new Date(startDate);
    application.duration = duration;
    application.endDate = calculatedEndDate;
    application.assignedInternship = assignedInternship;
    await application.save();
    console.log("Application status updated to shortlisted");

    // STEP 5: Generate offer letter PDF
    console.log("========== GENERATING OFFER LETTER ==========");
    let offerResult;
    try {
      offerResult = await generateOfferLetterPdf({
        studentId: application._id,
        studentName: student.name,
        role: `${assignedInternship} Intern`,
        startDate: new Date(startDate),
        duration,
        endDate: calculatedEndDate
      });
      console.log("Offer letter generated:", offerResult.relativeFilePath);
    } catch (err) {
      console.error("PDF GENERATION ERROR:", err.message);
      return res.status(500).json({ 
        message: "Failed to generate offer letter PDF",
        error: err.message
      });
    }

    // STEP 6: Save OfferLetter record
    const offerLetter = await OfferLetter.findOneAndUpdate(
      { studentId: student._id },
      { fileUrl: offerResult.relativeFilePath },
      { upsert: true, new: true }
    );
    console.log("Offer letter record saved");

    // STEP 7: Send offer letter email (non-blocking - in background)
    console.log("========== QUEUING OFFER LETTER EMAIL ==========");
    sendOfferLetterEmail({
      to: student.email,
      studentName: student.name,
      pdfBuffer: offerResult.pdfBuffer,
      startDate,
      duration,
      assignedInternship
    }).catch((err) => {
      console.error("Background email error:", err.message);
    });

    // STEP 8: Create internship record
    console.log("========== CREATING INTERNSHIP ==========");
    const internship = await Internship.create({
      studentId: student._id,
      startDate,
      duration: formatDuration(duration),
      endDate: calculatedEndDate,
      status: "ongoing"
    });

    // STEP 9: Update application to "ongoing"
    application.status = "ongoing";
    await application.save();
    console.log("Application status updated to ongoing");

    console.log("========== SHORTLIST SUCCESS ==========");

    res.json({
      success: true,
      message: "Candidate shortlisted and offer letter sent successfully",
      data: {
        application,
        offerLetter,
        internship
      }
    });

  } catch (error) {
    console.error("========== SHORTLIST UNEXPECTED ERROR ==========");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    next(error);
  }
};

const cancelCandidate = async (req, res, next) => {
  try {
    const { applicationId, cancelReason } = req.body;
    const targetApplicationId = req.params.id || applicationId;

    if (!targetApplicationId) {
      return res.status(400).json({ message: "applicationId is required" });
    }

    const reason = String(cancelReason || "").trim();
    if (!reason) {
      return res.status(400).json({ message: "cancelReason is required" });
    }

    const application = await Application.findById(targetApplicationId).populate("studentId", "name email");
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const normalizedStatus = String(application.status || "").toLowerCase();
    if (!["shortlisted", "ongoing", "active"].includes(normalizedStatus)) {
      return res.status(400).json({ message: "Only active internships can be cancelled" });
    }

    application.status = "cancelled";
    application.cancelReason = reason;
    application.cancelledAt = new Date();
    await application.save();

    const studentName = `${application.firstName || ""} ${application.lastName || ""}`.trim() || application.studentId?.name || "Student";
    const studentEmail = application.studentId?.email;

    if (studentEmail) {
      sendCancellationEmail({
        to: studentEmail,
        studentName,
        internshipType: application.assignedInternship || application.internshipPreference || "Internship Program",
        cancelReason: reason,
        cancelledAt: application.cancelledAt
      }).catch((emailError) => {
        console.error("Background cancellation email error:", emailError.message);
      });
    }

    res.json({
      message: "Internship cancelled successfully",
      application
    });
  } catch (error) {
    next(error);
  }
};

const rejectCandidate = async (req, res, next) => {
  try {
    const { applicationId } = req.body;
    const targetApplicationId = req.params.id || applicationId;

    if (!targetApplicationId) {
      res.status(400);
      throw new Error("applicationId is required");
    }

    const application = await Application.findById(targetApplicationId);
    if (!application) {
      res.status(404);
      throw new Error("Application not found");
    }

    application.status = "rejected";
    await application.save();

    res.json({ application });
  } catch (error) {
    next(error);
  }
};

const extendInternship = async (req, res, next) => {
  try {
    const { applicationId, extensionDuration } = req.body;

    if (!applicationId) {
      res.status(400);
      throw new Error("applicationId is required");
    }

    if (!extensionDuration) {
      res.status(400);
      throw new Error("extensionDuration is required");
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      res.status(404);
      throw new Error("Application not found");
    }

    if (application.status !== "shortlisted" && application.status !== "ongoing") {
      res.status(400);
      throw new Error("Only shortlisted or ongoing applications can be extended");
    }

    const internship = await Internship.findOne({ studentId: application.studentId }).sort({ createdAt: -1 });
    if (!internship) {
      res.status(404);
      throw new Error("Internship not found for this application");
    }

    const extensionMatch = String(extensionDuration)
      .trim()
      .toLowerCase()
      .match(/^(\d+)\s*(month|months)$/);

    if (!extensionMatch) {
      res.status(400);
      throw new Error("extensionDuration must be in month format like '1 month' or '2 months'");
    }

    const extensionMonths = Number(extensionMatch[1]);
    const currentEndDate = internship.endDate ? new Date(internship.endDate) : new Date();
    const updatedEndDate = new Date(currentEndDate);
    updatedEndDate.setMonth(updatedEndDate.getMonth() + extensionMonths);

    const currentDurationMatch = String(internship.duration || "")
      .trim()
      .toLowerCase()
      .match(/^(\d+)\s*(month|months)$/);

    if (currentDurationMatch) {
      const currentMonths = Number(currentDurationMatch[1]);
      const totalMonths = currentMonths + extensionMonths;
      internship.duration = `${totalMonths} ${totalMonths === 1 ? "Month" : "Months"}`;
    } else {
      const currentDurationDays = parseDurationToDays(internship.duration);
      const extensionDays = parseDurationToDays(extensionDuration);
      internship.duration = formatDuration(currentDurationDays + extensionDays);
    }

    internship.endDate = updatedEndDate;
    internship.status = "extended";
    await internship.save();

    res.json({
      message: "Internship extended successfully",
      application,
      internship
    });
  } catch (error) {
    next(error);
  }
};

const completeInternshipForApplication = async (req, res, next) => {
  try {
    console.log("========== COMPLETE INTERNSHIP REQUEST ==========");
    console.log("Body:", req.body);
    console.log("Params:", req.params);
    
    // Support both req.params.id and req.body.applicationId
    const applicationId = req.params.id || req.body.applicationId;
    console.log("Application ID:", applicationId);

    if (!applicationId) {
      console.log("ERROR: applicationId is required");
      return res.status(400).json({ message: "applicationId is required" });
    }

    // STEP 1: Find and validate application
    const application = await Application.findById(applicationId).populate("studentId", "name email");
    console.log("APPLICATION FOUND:", application ? "Yes" : "No");

    if (!application) {
      console.log("ERROR: Application not found");
      return res.status(404).json({ message: "Application not found" });
    }

    if (!application.studentId) {
      console.log("ERROR: Student data not populated");
      return res.status(404).json({ message: "Student data not found" });
    }

    const student = application.studentId;
    console.log("Student Name:", student.name);
    console.log("Student Email:", student.email);

    // STEP 2: Find internship and validate status
    const internship = await Internship.findOne({ studentId: student._id }).sort({ createdAt: -1 });
    
    if (!internship) {
      console.log("ERROR: Internship not found");
      return res.status(404).json({ message: "Internship not found" });
    }

    const normalizedStatus = String(internship.status || "").toLowerCase();
    console.log("Internship Status:", normalizedStatus);

    if (!["ongoing", "extended"].includes(normalizedStatus)) {
      console.log("ERROR: Cannot mark as complete. Status must be ongoing or extended");
      return res.status(400).json({ message: "Only ongoing internships can be marked as complete" });
    }

    // STEP 3: Update statuses in database
    console.log("========== UPDATING STATUSES ==========");
    internship.status = "completed";
    await internship.save();
    
    application.status = "completed";
    await application.save();
    console.log("Internship and Application status updated to completed");

    // STEP 4: Generate certificate PDF (returns buffer in memory)
    console.log("========== GENERATING CERTIFICATE ==========");
    let pdfBuffer;
    try {
      pdfBuffer = await generateCertificate({
        name: student.name,
        internshipType: application.assignedInternship || "Internship",
        startDate: application.startDate,
        endDate: application.endDate,
        issueDate: new Date().toLocaleDateString()
      });
      console.log("Certificate generated successfully, size:", pdfBuffer?.length, "bytes");
    } catch (err) {
      console.error("PDF GENERATION ERROR:", err.message);
      console.error("PDF ERROR STACK:", err.stack);
      return res.status(500).json({ 
        message: "Failed to generate certificate PDF",
        error: err.message
      });
    }

    if (!pdfBuffer) {
      console.log("ERROR: PDF Buffer is null or empty");
      return res.status(500).json({ message: "Certificate PDF generation returned empty buffer" });
    }

    // STEP 5: Send certificate email (non-blocking - in background)
    console.log("========== QUEUING CERTIFICATE EMAIL ==========");
    sendCertificateEmail({
      to: student.email,
      studentName: student.name,
      pdfBuffer
    }).catch((err) => {
      console.error("Background email error:", err.message);
    });

    console.log("========== COMPLETE INTERNSHIP SUCCESS ==========");
    
    res.json({
      success: true,
      message: "Internship completed and certificate sent successfully",
      data: {
        application,
        internship
      }
    });

  } catch (error) {
    console.error("========== COMPLETE INTERNSHIP UNEXPECTED ERROR ==========");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    next(error);
  }
};

const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      res.status(400);
      throw new Error("status is required");
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      res.status(404);
      throw new Error("Application not found");
    }

    application.status = status;
    await application.save();

    let offerLetter = null;
    if (status === "shortlisted") {
      offerLetter = await triggerOfferLetterGeneration(application);
    }

    res.json({ application, offerLetter });
  } catch (error) {
    next(error);
  }
};

const downloadCertificate = async (req, res, next) => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id).populate("studentId", "name email");
    if (!application) {
      res.status(404);
      throw new Error("Application not found");
    }

    // Check if application is completed
    if (String(application?.status || "").toLowerCase() !== "completed") {
      res.status(400);
      throw new Error("Certificate is only available for completed internships");
    }

    const internship = await Internship.findOne({ studentId: application.studentId._id }).sort({ createdAt: -1 });
    if (!internship) {
      res.status(404);
      throw new Error("Internship not found");
    }

    // Generate certificate PDF
    const pdfBuffer = await generateCertificate({
      name: application.studentId.name,
      internshipType: application?.assignedInternship || "Internship",
      startDate: internship.startDate,
      endDate: internship.endDate
    });

    // Set response headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="certificate-${application.studentId.name.replace(/\s+/g, '-')}.pdf"`);
    
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

export {
  submitApplication,
  getAllApplications,
  getSingleApplication,
  getMyApplicationStatus,
  getMyActiveApplication,
  getMyApplication,
  shortlistCandidate,
  rejectCandidate,
  cancelCandidate,
  extendInternship,
  completeInternshipForApplication,
  updateApplicationStatus,
  downloadCertificate
};
