import WeeklyLog from "../models/WeeklyLog.js";
import Application from "../models/Application.js";

const normalizeDateOnly = (dateValue, endOfDay = false) => {
  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  const normalizedDate = new Date(parsedDate);
  normalizedDate.setHours(endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0, endOfDay ? 999 : 0);
  return normalizedDate;
};

const addDays = (dateValue, days) => {
  const startDate = new Date(dateValue);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + days);
  return endDate;
};

const isOwnedApplication = (application, userId, role) => {
  if (!application) {
    return false;
  }

  if (role === "admin") {
    return true;
  }

  return String(application.studentId) === String(userId);
};

const createWeeklyLog = async (req, res, next) => {
  try {
    const { applicationId, weekStartDate, tasksCompleted, achievements, challenges, hoursWorked, status, projectLink, mentorRemarks } = req.body;

    if (!applicationId || !weekStartDate || !tasksCompleted) {
      return res.status(400).json({
        message: "applicationId, weekStartDate and tasksCompleted are required"
      });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (!isOwnedApplication(application, req.user._id, req.user.role)) {
      return res.status(403).json({ message: "You are not allowed to create logs for this application" });
    }

    const selectedWeekStartDate = normalizeDateOnly(weekStartDate);
    if (!selectedWeekStartDate) {
      return res.status(400).json({ message: "weekStartDate must be a valid date" });
    }

    const normalizedWeekStartDate = new Date(selectedWeekStartDate);
    normalizedWeekStartDate.setHours(0, 0, 0, 0);

    const normalizedWeekEndDate = addDays(normalizedWeekStartDate, 6);
    normalizedWeekEndDate.setHours(23, 59, 59, 999);

    const duplicateLog = await WeeklyLog.findOne({
      applicationId,
      weekStartDate: normalizedWeekStartDate
    });

    if (duplicateLog) {
      return res.status(400).json({ message: "A weekly log already exists for this week" });
    }

    const weeklyLog = await WeeklyLog.create({
      studentId: application.studentId,
      applicationId,
      weekStartDate: normalizedWeekStartDate,
      weekEndDate: normalizedWeekEndDate,
      tasksCompleted,
      achievements: achievements || "",
      challenges: challenges || "",
      hoursWorked: typeof hoursWorked === "number" ? hoursWorked : Number(hoursWorked || 0),
      status: status || "pending",
      projectLink: projectLink || null,
      mentorRemarks: mentorRemarks || null
    });

    res.status(201).json({
      message: "Weekly log created successfully",
      weeklyLog
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "A weekly log already exists for this week" });
    }

    next(error);
  }
};

const getWeeklyLogsByApplication = async (req, res, next) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (!isOwnedApplication(application, req.user._id, req.user.role)) {
      return res.status(403).json({ message: "You are not allowed to view logs for this application" });
    }

    const weeklyLogs = await WeeklyLog.find({ applicationId })
      .populate("studentId", "name email role")
      .populate("applicationId", "firstName lastName college status assignedInternship")
      .sort({ weekStartDate: -1, createdAt: -1 });

    res.json({
      applicationId,
      weeklyLogs
    });
  } catch (error) {
    next(error);
  }
};

const getAllWeeklyLogs = async (_req, res, next) => {
  try {
    const weeklyLogs = await WeeklyLog.find()
      .populate("studentId", "name email role")
      .populate("applicationId", "firstName lastName college status assignedInternship")
      .sort({ weekStartDate: -1, createdAt: -1 });

    res.json({ weeklyLogs });
  } catch (error) {
    next(error);
  }
};

const updateWeeklyLog = async (req, res, next) => {
  try {
    const weeklyLog = await WeeklyLog.findById(req.params.id);
    if (!weeklyLog) {
      return res.status(404).json({ message: "Weekly log not found" });
    }

    const application = await Application.findById(weeklyLog.applicationId);
    if (!isOwnedApplication(application, req.user._id, req.user.role)) {
      return res.status(403).json({ message: "You are not allowed to update this weekly log" });
    }

    const {
      weekStartDate,
      tasksCompleted,
      achievements,
      challenges,
      hoursWorked,
      status,
      projectLink,
      mentorRemarks
    } = req.body;

    if (typeof weekStartDate !== "undefined") {
      const selectedWeekStartDate = normalizeDateOnly(weekStartDate);
      if (!selectedWeekStartDate) {
        return res.status(400).json({ message: "weekStartDate must be a valid date" });
      }

      const normalizedWeekStartDate = new Date(selectedWeekStartDate);
      normalizedWeekStartDate.setHours(0, 0, 0, 0);
      weeklyLog.weekStartDate = normalizedWeekStartDate;
      weeklyLog.weekEndDate = addDays(normalizedWeekStartDate, 6);
      weeklyLog.weekEndDate.setHours(23, 59, 59, 999);
    }

    if (typeof tasksCompleted !== "undefined") {
      if (!String(tasksCompleted).trim()) {
        return res.status(400).json({ message: "tasksCompleted is required" });
      }
      weeklyLog.tasksCompleted = tasksCompleted;
    }

    if (typeof achievements !== "undefined") {
      weeklyLog.achievements = achievements || "";
    }

    if (typeof challenges !== "undefined") {
      weeklyLog.challenges = challenges || "";
    }

    if (typeof hoursWorked !== "undefined") {
      weeklyLog.hoursWorked = Number(hoursWorked);
    }

    if (typeof status !== "undefined") {
      weeklyLog.status = status;
    }

    if (typeof projectLink !== "undefined") {
      weeklyLog.projectLink = projectLink || null;
    }

    if (typeof mentorRemarks !== "undefined") {
      weeklyLog.mentorRemarks = mentorRemarks || null;
    }

    const existingDuplicate = await WeeklyLog.findOne({
      _id: { $ne: weeklyLog._id },
      applicationId: weeklyLog.applicationId,
      weekStartDate: weeklyLog.weekStartDate
    });

    if (existingDuplicate) {
      return res.status(400).json({ message: "A weekly log already exists for this week" });
    }

    await weeklyLog.save();

    res.json({
      message: "Weekly log updated successfully",
      weeklyLog
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "A weekly log already exists for this week" });
    }

    next(error);
  }
};

const deleteWeeklyLog = async (req, res, next) => {
  try {
    const weeklyLog = await WeeklyLog.findById(req.params.id);
    if (!weeklyLog) {
      return res.status(404).json({ message: "Weekly log not found" });
    }

    const application = await Application.findById(weeklyLog.applicationId);
    if (!isOwnedApplication(application, req.user._id, req.user.role)) {
      return res.status(403).json({ message: "You are not allowed to delete this weekly log" });
    }

    await weeklyLog.deleteOne();

    res.json({ message: "Weekly log deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export {
  createWeeklyLog,
  getAllWeeklyLogs,
  getWeeklyLogsByApplication,
  updateWeeklyLog,
  deleteWeeklyLog
};