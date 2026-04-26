import Application from "../models/Application.js";
import WeeklyLog from "../models/WeeklyLog.js";

const formatDate = (dateValue) => {
  if (!dateValue) return null;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric"
  });
};

const getUniqueWeeks = (logs) => {
  const seen = new Set();

  logs.forEach((log) => {
    const start = new Date(log.weekStartDate);
    if (Number.isNaN(start.getTime())) {
      return;
    }

    seen.add(start.toISOString().slice(0, 10));
  });

  return seen.size;
};

const getTotalWeeksFromRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0;
  }

  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const diff = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(diff / msPerWeek) + 1);
};

const summarizeSection = (items, fallback) => {
  const cleaned = items
    .map((item) => String(item || "").trim())
    .filter(Boolean);

  if (cleaned.length === 0) {
    return fallback;
  }

  return cleaned;
};

const buildOverallPerformance = ({ completionRate, consistencyRate, totalHours, completedLogs, partialLogs, pendingLogs }) => {
  if (completionRate >= 80 && consistencyRate >= 80) {
    return "Excellent performance with consistent weekly progress and strong delivery.";
  }

  if (completionRate >= 60 && consistencyRate >= 60) {
    return "Good overall performance with steady progress and room for stronger consistency.";
  }

  if (totalHours > 0) {
    return "Progress is visible, but weekly consistency and completion quality need improvement.";
  }

  return "No meaningful weekly activity was recorded yet.";
};

const buildAdminFeedback = (weeklyLogs) => {
  const remarks = weeklyLogs
    .map((log) => String(log.mentorRemarks || "").trim())
    .filter(Boolean);

  if (remarks.length === 0) {
    return "No admin feedback has been recorded yet.";
  }

  return remarks.slice(0, 3).join(" ");
};

export const generateWeeklyReport = async (applicationId) => {
  if (!applicationId) {
    throw new Error("applicationId is required");
  }

  const application = await Application.findById(applicationId)
    .populate("studentId", "name email role")
    .lean();

  if (!application) {
    throw new Error("Application not found");
  }

  const weeklyLogs = await WeeklyLog.find({ applicationId })
    .sort({ weekStartDate: 1, createdAt: 1 })
    .lean();

  const totalLogs = weeklyLogs.length;
  const totalHours = weeklyLogs.reduce((sum, log) => sum + Number(log.hoursWorked || 0), 0);

  const completedLogs = weeklyLogs.filter((log) => String(log.status || "").toLowerCase() === "completed").length;
  const partialLogs = weeklyLogs.filter((log) => String(log.status || "").toLowerCase() === "partial").length;
  const pendingLogs = weeklyLogs.filter((log) => String(log.status || "").toLowerCase() === "pending").length;

  const completionRate = totalLogs > 0 ? Math.round((completedLogs / totalLogs) * 100) : 0;

  const expectedWeeks =
    getTotalWeeksFromRange(application.startDate, application.endDate) ||
    getUniqueWeeks(weeklyLogs) ||
    totalLogs;

  const submittedWeeks = getUniqueWeeks(weeklyLogs) || totalLogs;
  const consistencyRate = expectedWeeks > 0 ? Math.round((submittedWeeks / expectedWeeks) * 100) : 0;

  const achievements = summarizeSection(
    weeklyLogs.map((log) => log.achievements),
    ["No achievements reported yet."]
  );

  const challenges = summarizeSection(
    weeklyLogs.map((log) => log.challenges),
    ["No challenges reported yet."]
  );

  const highlightCount = Math.min(5, weeklyLogs.length);
  const weeklyBreakdown = weeklyLogs.slice(0, highlightCount).map((log, index) => ({
    id: String(log._id),
    weekNumber: index + 1,
    weekStartDate: log.weekStartDate,
    weekEndDate: log.weekEndDate,
    weekRange: `${formatDate(log.weekStartDate) || "Not available"} - ${formatDate(log.weekEndDate) || "Not available"}`,
    tasksCompleted: log.tasksCompleted || "",
    achievements: log.achievements || "",
    challenges: log.challenges || "",
    hoursWorked: Number(log.hoursWorked || 0),
    status: log.status || "pending",
    projectLink: log.projectLink || null,
    mentorRemarks: log.mentorRemarks || null,
    createdAt: log.createdAt || null
  }));

  const adminFeedback = buildAdminFeedback(weeklyLogs);

  const report = {
    reportType: "weekly-internship-report",
    application: {
      id: String(application._id),
      studentId: application.studentId
        ? {
            id: String(application.studentId._id || application.studentId),
            name: application.studentId.name || null,
            email: application.studentId.email || null,
            role: application.studentId.role || null
          }
        : null,
      firstName: application.firstName || null,
      lastName: application.lastName || null,
      college: application.college || null,
      internshipPreference: application.internshipPreference || null,
      assignedInternship: application.assignedInternship || null,
      status: application.status || null,
      startDate: application.startDate || null,
      endDate: application.endDate || null,
      duration: application.duration || null
    },
    metrics: {
      totalWeeks: expectedWeeks,
      submittedWeeks,
      totalLogs,
      totalHours,
      completionRate,
      consistencyRate,
      completedLogs,
      partialLogs,
      pendingLogs
    },
    summary: {
      achievements,
      challenges,
      adminFeedback,
      overallPerformance: buildOverallPerformance({
        completionRate,
        consistencyRate,
        totalHours,
        completedLogs,
        partialLogs,
        pendingLogs
      })
    },
    weeklyBreakdown,
    generatedAt: new Date().toISOString()
  };

  return report;
};

export default generateWeeklyReport;