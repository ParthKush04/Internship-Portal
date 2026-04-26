import Certificate from "../models/Certificate.js";
import Application from "../models/Application.js";
import Internship from "../models/Internship.js";
import User from "../models/User.js";
import generateCertificatePdf from "../utils/generateCertificatePdf.js";
import sendCertificateEmail from "../utils/sendCertificateEmail.js";
import fs from "fs";
import path from "path";

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

const extendInternshipDuration = async (req, res, next) => {
  try {
    const { duration } = req.body;
    if (!duration) {
      res.status(400);
      throw new Error("duration is required");
    }

    const internship = await Internship.findById(req.params.id);
    if (!internship) {
      res.status(404);
      throw new Error("Internship not found");
    }

    const extensionDays = parseDurationToDays(duration);
    internship.endDate = addDays(internship.endDate, extensionDays);
    internship.duration = `${internship.duration} + ${formatDuration(duration)}`;
    internship.status = "extended";
    await internship.save();

    res.json(internship);
  } catch (error) {
    next(error);
  }
};

const generateCompletionCertificate = async (req, res, next) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) {
      res.status(404);
      throw new Error("Internship not found");
    }

    const student = await User.findById(internship.studentId).select("name");
    if (!student) {
      res.status(404);
      throw new Error("Student not found");
    }

    const latestApplication = await Application.findOne({ studentId: internship.studentId }).sort({ createdAt: -1 });
    const internshipDomain =
      latestApplication?.internshipDomain ||
      latestApplication?.domain ||
      (Array.isArray(latestApplication?.skills) && latestApplication.skills.length > 0
        ? latestApplication.skills.join(", ")
        : "Internship Program");

    const existingCertificate = await Certificate.findOne({ studentId: internship.studentId });
    if (existingCertificate) {
      res.json(existingCertificate);
      return;
    }

    const fileUrl = await generateCertificatePdf({
      studentId: internship.studentId,
      studentName: student.name,
      duration: internship.duration,
      companyName: "Provisioning Tech",
      internshipDomain,
      completionDate: internship.endDate || new Date()
    });

    const certificate = await Certificate.create({
      studentId: internship.studentId,
      fileUrl
    });

    res.status(201).json(certificate);
  } catch (error) {
    next(error);
  }
};

const completeInternship = async (req, res, next) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) {
      res.status(404);
      throw new Error("Internship not found");
    }

    const student = await User.findById(internship.studentId).select("name email");
    if (!student) {
      res.status(404);
      throw new Error("Student not found");
    }

    const latestApplication = await Application.findOne({ studentId: internship.studentId }).sort({ createdAt: -1 });
    const internshipDomain =
      latestApplication?.internshipDomain ||
      latestApplication?.domain ||
      (Array.isArray(latestApplication?.skills) && latestApplication.skills.length > 0
        ? latestApplication.skills.join(", ")
        : "Internship Program");

    internship.status = "completed";
    await internship.save();

    if (latestApplication) {
      latestApplication.status = "completed";
      await latestApplication.save();
    }

    let certificate = await Certificate.findOne({ studentId: internship.studentId });
    if (!certificate) {
      const fileUrl = await generateCertificatePdf({
        studentId: internship.studentId,
        studentName: student.name,
        duration: internship.duration,
        companyName: "Provisioning Tech",
        internshipDomain,
        completionDate: internship.endDate || new Date()
      });

      certificate = await Certificate.create({
        studentId: internship.studentId,
        fileUrl
      });
    }

    // Send certificate email (non-blocking - in background)
    const certificateFilePath = path.resolve(certificate.fileUrl);
    let pdfBuffer;
    try {
      pdfBuffer = fs.readFileSync(certificateFilePath);
    } catch (fileError) {
      console.error("Failed to read certificate file:", fileError.message);
      // Continue even if file read fails - email will be queued for background handling
    }

    if (pdfBuffer) {
      sendCertificateEmail({
        to: student.email,
        studentName: student.name,
        pdfBuffer
      }).catch(err => {
        console.error("Background certificate email error:", err.message);
      });
    }

    res.json({ internship, certificate });
  } catch (error) {
    next(error);
  }
};

const getMyInternshipStatus = async (req, res, next) => {
  try {
    const internship = await Internship.findOne({ studentId: req.user._id }).sort({ createdAt: -1 });
    if (!internship) {
      res.json({ status: null });
      return;
    }

    res.json({
      status: internship.status,
      internshipId: internship._id,
      startDate: internship.startDate,
      endDate: internship.endDate,
      duration: internship.duration
    });
  } catch (error) {
    next(error);
  }
};

export {
  extendInternshipDuration,
  generateCompletionCertificate,
  completeInternship,
  getMyInternshipStatus
};
