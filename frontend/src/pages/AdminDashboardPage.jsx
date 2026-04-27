import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import api, { setAuthToken } from "../services/api";
import Spinner from "../components/Spinner";

const normalizeResumeUrl = (resumePath) => {
  if (!resumePath) return "";

  if (/^https?:\/\//i.test(resumePath)) {
    return resumePath;
  }

  const normalized = resumePath.replace(/\\/g, "/");
  const marker = "/uploads/";
  const markerIndex = normalized.lastIndexOf(marker);
  if (markerIndex >= 0) {
    return normalized.slice(markerIndex);
  }

  const fileName = normalized.split("/").pop();
  return fileName ? `/uploads/resumes/${fileName}` : "";
};

const buildResumeHref = (resumePath) => {
  const normalizedPath = normalizeResumeUrl(resumePath);
  if (!normalizedPath) return "";

  if (/^https?:\/\//i.test(normalizedPath)) {
    return normalizedPath;
  }

  const apiBaseUrl = import.meta.env.VITE_API_URL || api.defaults.baseURL || "";

  try {
    const apiOrigin = new URL(apiBaseUrl, window.location.origin).origin;
    return `${apiOrigin}${normalizedPath.startsWith("/") ? "" : "/"}${normalizedPath}`;
  } catch {
    return normalizedPath;
  }
};

const getStatusBadgeColor = (status) => {
  if (!status) return "bg-gray-200 text-gray-800";
  const lower = status.toLowerCase();
  if (lower.includes("pending")) return "bg-yellow-100 text-yellow-800";
  if (lower.includes("shortlist")) return "bg-green-100 text-green-800";
  if (lower.includes("active")) return "bg-green-100 text-green-800";
  if (lower.includes("ongoing")) return "bg-green-100 text-green-800";
  if (lower.includes("extend")) return "bg-green-100 text-green-800";
  if (lower.includes("complete")) return "bg-blue-100 text-blue-800";
  if (lower.includes("reject")) return "bg-red-100 text-red-800";
  if (lower.includes("cancel")) return "bg-orange-100 text-orange-800";
  return "bg-slate-100 text-slate-800";
};

const formatDisplayDate = (dateValue) => {
  if (!dateValue) return "Not available";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric"
  });
};

function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [shortlistForms, setShortlistForms] = useState({});
  const [extendForms, setExtendForms] = useState({});
  const [assignedInternships, setAssignedInternships] = useState({});
  const [cancelModal, setCancelModal] = useState({
    isOpen: false,
    applicationId: null,
    applicationName: "",
    reason: "",
    submitting: false
  });
  const [weeklyReportsModalOpen, setWeeklyReportsModalOpen] = useState(false);
  const [weeklyLogs, setWeeklyLogs] = useState([]);
  const [weeklyLogsLoading, setWeeklyLogsLoading] = useState(false);
  const [weeklyLogsError, setWeeklyLogsError] = useState("");
  const [expandedWeeklyLogIds, setExpandedWeeklyLogIds] = useState({});
  const [mentorRemarksDrafts, setMentorRemarksDrafts] = useState({});
  const [savingRemarkId, setSavingRemarkId] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: applications = [],
    isLoading: loading,
    error: queryError
  } = useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please login as admin.");
      }

      setAuthToken(token);
      const { data } = await api.get("/applications");
      return Array.isArray(data)
        ? data
        : Array.isArray(data?.applications)
          ? data.applications
          : [];
    }
  });

  const updateShortlistForm = (appId, key, value) => {
    setShortlistForms((prev) => ({
      ...prev,
      [appId]: { ...(prev[appId] || { startDate: "", duration: "" }), [key]: value }
    }));
  };

  const toggleExtendForm = (appId) => {
    setExtendForms((prev) => ({
      ...prev,
      [appId]: {
        ...(prev[appId] || { extensionDuration: "", isOpen: false, submitting: false }),
        isOpen: !(prev[appId]?.isOpen)
      }
    }));
  };

  const setExtendModal = (appId) => {
    toggleExtendForm(appId);
  };

  const updateExtendForm = (appId, value) => {
    setExtendForms((prev) => ({
      ...prev,
      [appId]: {
        ...(prev[appId] || { isOpen: true, submitting: false }),
        extensionDuration: value,
        isOpen: true,
        submitting: prev[appId]?.submitting || false
      }
    }));
  };

  const shortlistCandidate = async (appId) => {
    const form = shortlistForms[appId] || {};
    const { startDate, duration } = form;
    const selectedInternship = assignedInternships[appId] || "";
    if (!startDate || !duration || !selectedInternship) {
      const message = "Please select duration, start date, and internship type";
      setError(message);
      toast.error(message);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      setAuthToken(token);
      await api.patch(`/applications/${appId}/shortlist`, {
        startDate,
        duration,
        assignedInternship: selectedInternship
      });
      toast.success("Candidate moved to active internship successfully");
      await queryClient.invalidateQueries({ queryKey: ["applications"] });
      // Clear the form after successful shortlisting
      setShortlistForms((prev) => ({
        ...prev,
        [appId]: { startDate: "", duration: "" }
      }));
      setAssignedInternships((prev) => ({
        ...prev,
        [appId]: ""
      }));
    } catch (err) {
      const message = err.response?.data?.message || "Failed to shortlist candidate";
      setError(message);
      toast.error(message);
    }
  };

  const rejectCandidate = async (appId) => {
    const confirmed = window.confirm("Are you sure?");
    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      setAuthToken(token);
      await api.post("/applications/reject", { applicationId: appId });
      toast.success("Candidate rejected successfully");
      await queryClient.invalidateQueries({ queryKey: ["applications"] });
    } catch (err) {
      const message = err.response?.data?.message || "Failed to reject candidate";
      setError(message);
      toast.error(message);
    }
  };

  const openCancelModal = (application) => {
    setCancelModal({
      isOpen: true,
      applicationId: application._id,
      applicationName: `${application.firstName || ""} ${application.lastName || ""}`.trim(),
      reason: "",
      submitting: false
    });
  };

  const formatWeeklyLogDate = (dateValue) => {
    if (!dateValue) return "Not available";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "Not available";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric"
    });
  };

  const summarizeWeeklyLog = (log) => {
    const source = String(log?.tasksCompleted || log?.achievements || log?.challenges || "").trim();
    if (!source) return "No summary available";
    return source.length > 120 ? `${source.slice(0, 117)}...` : source;
  };

  const openWeeklyReportsModal = async () => {
    setWeeklyReportsModalOpen(true);

    if (weeklyLogs.length > 0) {
      return;
    }

    setWeeklyLogsLoading(true);
    setWeeklyLogsError("");

    try {
      const token = localStorage.getItem("token");
      setAuthToken(token);
      const { data } = await api.get("/weekly-logs");
      const logs = Array.isArray(data?.weeklyLogs) ? data.weeklyLogs : [];
      setWeeklyLogs(logs);

      setMentorRemarksDrafts((prev) => {
        const nextDrafts = { ...prev };
        logs.forEach((log) => {
          nextDrafts[log._id] = typeof nextDrafts[log._id] === "string" ? nextDrafts[log._id] : (log.mentorRemarks || "");
        });
        return nextDrafts;
      });
    } catch (err) {
      const message = err.response?.data?.message || "Failed to load weekly logs";
      setWeeklyLogsError(message);
      toast.error(message);
    } finally {
      setWeeklyLogsLoading(false);
    }
  };

  const closeWeeklyReportsModal = () => {
    setWeeklyReportsModalOpen(false);
  };

  const toggleWeeklyLogExpanded = (logId) => {
    setExpandedWeeklyLogIds((prev) => ({
      ...prev,
      [logId]: !prev[logId]
    }));
  };

  const updateMentorRemarksDraft = (logId, value) => {
    setMentorRemarksDrafts((prev) => ({
      ...prev,
      [logId]: value
    }));
  };

  const saveMentorRemarks = async (logId) => {
    const mentorRemarks = String(mentorRemarksDrafts[logId] || "").trim();

    setSavingRemarkId(logId);
    try {
      const token = localStorage.getItem("token");
      setAuthToken(token);
      await api.put(`/weekly-logs/${logId}`, { mentorRemarks });

      setWeeklyLogs((prev) =>
        prev.map((log) => (String(log._id) === String(logId) ? { ...log, mentorRemarks } : log))
      );

      toast.success("Mentor remarks saved successfully");
    } catch (err) {
      const message = err.response?.data?.message || "Failed to save mentor remarks";
      setWeeklyLogsError(message);
      toast.error(message);
    } finally {
      setSavingRemarkId(null);
    }
  };

  const closeCancelModal = () => {
    setCancelModal({
      isOpen: false,
      applicationId: null,
      applicationName: "",
      reason: "",
      submitting: false
    });
  };

  const submitCancelInternship = async () => {
    if (!cancelModal.reason.trim()) {
      const message = "Please enter a cancel reason.";
      setError(message);
      toast.error(message);
      return;
    }

    setCancelModal((prev) => ({ ...prev, submitting: true }));

    try {
      const token = localStorage.getItem("token");
      setAuthToken(token);
      await api.patch(`/applications/${cancelModal.applicationId}/cancel`, {
        cancelReason: cancelModal.reason
      });

      toast.success("Internship cancelled successfully");
      await queryClient.invalidateQueries({ queryKey: ["applications"] });
      closeCancelModal();
    } catch (err) {
      const message = err.response?.data?.message || "Failed to cancel internship";
      setError(message);
      toast.error(message);
      setCancelModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  const extendInternship = async (appId) => {
    const form = extendForms[appId] || {};
    if (!form.extensionDuration) {
      const message = "Please select extension duration.";
      setError(message);
      toast.error(message);
      return;
    }

    setExtendForms((prev) => ({
      ...prev,
      [appId]: {
        ...(prev[appId] || {}),
        extensionDuration: form.extensionDuration,
        isOpen: true,
        submitting: true
      }
    }));

    try {
      const token = localStorage.getItem("token");
      setAuthToken(token);
      const { data } = await api.post("/applications/extend", {
        applicationId: appId,
        extensionDuration: form.extensionDuration
      });

      await queryClient.invalidateQueries({ queryKey: ["applications"] });

      setExtendForms((prev) => ({
        ...prev,
        [appId]: {
          extensionDuration: "",
          isOpen: false,
          submitting: false
        }
      }));

      toast.success("Internship extended successfully");
    } catch (err) {
      const message = err.response?.data?.message || "Failed to extend internship";
      setError(message);
      toast.error(message);
      setExtendForms((prev) => ({
        ...prev,
        [appId]: {
          ...(prev[appId] || {}),
          extensionDuration: form.extensionDuration,
          isOpen: true,
          submitting: false
        }
      }));
    }
  };

  const completeInternship = async (appId) => {
    const confirmed = window.confirm("Mark this internship as complete?");
    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      setAuthToken(token);
      await api.post("/applications/complete", { applicationId: appId });
      await queryClient.invalidateQueries({ queryKey: ["applications"] });

      toast.success("Certificate sent successfully");
    } catch (err) {
      console.error("========== COMPLETE INTERNSHIP ERROR ==========");
      console.error("Error response:", err.response?.data || err.message);
      console.error("Error status:", err.response?.status);
      console.error("Full error:", err);
      console.error("=========================================");
      
      const message = err.response?.data?.message || err.response?.data?.error || "Failed to mark internship as complete";
      setError(message);
      toast.error(message);
    }
  };

  const totalApplications = applications.length;
  const pendingCount = applications.filter((item) => item.status === "pending").length;
  const cancelledCount = applications.filter((item) => item.status === "cancelled").length;
  const rejectedCount = applications.filter((item) => item.status === "rejected").length;
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const searchedApplications = applications.filter((item) => {
    if (!normalizedSearch) return true;

    const fullName = `${item.firstName || ""} ${item.lastName || ""}`.trim().toLowerCase();
    const college = (item.college || "").toLowerCase();
    return fullName.includes(normalizedSearch) || college.includes(normalizedSearch);
  });

  const isCompletedApplication = (item) => {
    const internshipStatus = String(item?.internship?.status || "").toLowerCase();
    return item.status === "completed" || internshipStatus === "completed";
  };

  const isCancelledApplication = (item) => item.status === "cancelled";

  const isActiveApplication = (item) => {
    if (
      item.status === "pending" ||
      item.status === "rejected" ||
      isCompletedApplication(item) ||
      isCancelledApplication(item)
    ) {
      return false;
    }

    const internshipStatus = String(item?.internship?.status || "").toLowerCase();
    return ["shortlisted", "active"].includes(item.status) || ["active", "ongoing", "extended"].includes(internshipStatus);
  };

  const pendingApplications = searchedApplications.filter((item) => item.status === "pending");
  const activeApplications = searchedApplications.filter((item) => isActiveApplication(item));
  const completedApplications = searchedApplications.filter((item) => isCompletedApplication(item));
  const cancelledApplications = searchedApplications.filter((item) => isCancelledApplication(item));
  const activeCount = activeApplications.length;

  const tabbedApplications =
    activeTab === "pending"
      ? pendingApplications
      : activeTab === "active"
        ? activeApplications
        : activeTab === "cancelled"
          ? cancelledApplications
          : completedApplications;

  const renderApplicationCard = (application) => {
    const resumeHref = buildResumeHref(application.resume);
    const form = shortlistForms[application._id] || { startDate: "", duration: "" };
    const extendForm = extendForms[application._id] || {
      extensionDuration: "",
      isOpen: false,
      submitting: false
    };
    const isFormValid = form.startDate && form.duration;
    const isProcessed =
      application.status === "shortlisted" ||
      application.status === "rejected" ||
      application.status === "completed" ||
      application.status === "cancelled";
    const isCancelled = application.status === "cancelled";
    const normalizedInternshipStatus = String(application.internship?.status || "").toLowerCase();
    const isPendingApplication = application.status === "pending";
    const showInternshipTimeline =
      !isPendingApplication && (
        application.status === "shortlisted" ||
        application.status === "active" ||
        application.status === "completed" ||
        application.status === "ongoing" ||
        ["active", "ongoing", "extended", "completed"].includes(normalizedInternshipStatus)
      );
    const canMarkAsComplete =
      !isPendingApplication &&
      !isCancelled &&
      ["active", "ongoing", "extended"].includes(normalizedInternshipStatus);
    const canShowExtendButton =
      !isPendingApplication &&
      !isCancelled && (
        application.status === "shortlisted" ||
        application.status === "ongoing" ||
        normalizedInternshipStatus === "ongoing"
      );
    const canCancelInternship =
      !isPendingApplication &&
      !isCancelled && (
        application.status === "shortlisted" ||
        application.status === "ongoing" ||
        ["active", "ongoing", "extended"].includes(normalizedInternshipStatus)
      );

    return (
      <article
        key={application._id}
        className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow p-6"
      >
        {/* Header */}
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900">
              {application.firstName} {application.lastName}
            </h3>
            <p className="text-sm text-slate-600">{application.college}</p>
            <p className="text-sm text-gray-500">
              Preference: <span className="font-semibold">{application.internshipPreference || "Not provided"}</span>
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-4">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(application.status)}`}
          >
            {application.status}
          </span>
        </div>

        {/* Resume Button */}
        <div className="mb-4">
          {resumeHref ? (
            <a
              href={resumeHref}
              target="_blank"
              rel="noreferrer noopener"
              className="w-full inline-block px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-medium text-center transition-colors"
            >
              📄 View Resume
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="w-full inline-block px-4 py-2 bg-slate-300 text-slate-600 rounded-lg text-sm font-medium text-center cursor-not-allowed"
            >
              📄 Resume Not Available
            </button>
          )}
        </div>

        {/* Internship Details Form (only for pending applications) */}
        {application.status === "pending" && (
          <div className="border-t border-slate-200 pt-4">
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Internship Details</h4>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(event) =>
                    updateShortlistForm(application._id, "startDate", event.target.value)
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Duration</label>
                <select
                  value={form.duration}
                  onChange={(event) =>
                    updateShortlistForm(application._id, "duration", event.target.value)
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                >
                  <option value="">Select duration</option>
                  <option value="1 Month">1 Month</option>
                  <option value="2 Months">2 Months</option>
                  <option value="3 Months">3 Months</option>
                  <option value="6 Months">6 Months</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-700 mb-1">Assigned Internship</label>
              <select
                value={assignedInternships[application._id] || ""}
                onChange={(event) =>
                  setAssignedInternships((prev) => ({
                    ...prev,
                    [application._id]: event.target.value
                  }))
                }
                className="w-full p-2 border rounded"
              >
                <option value="">Select Internship Type</option>
                <option value="MERN Stack">MERN Stack</option>
                <option value="AI/ML">AI/ML</option>
                <option value="Digital Marketing">Digital Marketing</option>
                <option value="Web Development">Web Development</option>
                <option value="App Development">App Development</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => shortlistCandidate(application._id)}
                disabled={!isFormValid}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isFormValid
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                ✓ Shortlist
              </button>
              <button
                type="button"
                onClick={() => rejectCandidate(application._id)}
                className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                ✗ Reject
              </button>
            </div>
          </div>
        )}

        {showInternshipTimeline && (
          <div className="border-t border-slate-200 pt-4 mb-4">
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Internship Timeline</h4>
            <div className="space-y-2 rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Start Date</span>
                <span className="font-medium text-slate-800">
                  {formatDisplayDate(application.internship?.startDate)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Duration</span>
                <span className="font-medium text-slate-800">
                  {application.internship?.duration || "Not available"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">End Date</span>
                <span className="font-medium text-slate-800">
                  {formatDisplayDate(application.internship?.endDate)}
                </span>
              </div>
            </div>

            {canShowExtendButton && extendForm.isOpen && (
              <div className="mt-3">
                <div className="rounded-lg border border-slate-200 bg-white p-3 mt-2">
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Extension Duration
                  </label>
                  <select
                    value={extendForm.extensionDuration}
                    onChange={(event) => updateExtendForm(application._id, event.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                  >
                    <option value="">Select extension</option>
                    <option value="1 month">1 month</option>
                    <option value="2 months">2 months</option>
                    <option value="3 months">3 months</option>
                  </select>

                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => extendInternship(application._id)}
                      disabled={!extendForm.extensionDuration || extendForm.submitting}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        !extendForm.extensionDuration || extendForm.submitting
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {extendForm.submitting ? "Extending..." : "Submit"}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setExtendForms((prev) => ({
                          ...prev,
                          [application._id]: {
                            extensionDuration: "",
                            isOpen: false,
                            submitting: false
                          }
                        }))
                      }
                      disabled={extendForm.submitting}
                      className="flex-1 px-3 py-2 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {canMarkAsComplete && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => completeInternship(application._id)}
                  className="w-full px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
                >
                  Mark as Complete
                </button>
              </div>
            )}

            <div className="mt-2 space-y-2">
              {canShowExtendButton && (
                <button
                  type="button"
                  onClick={() => setExtendModal(application._id)}
                  className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600"
                >
                  Extend Internship
                </button>
              )}

              {canCancelInternship && (
                <button
                  type="button"
                  onClick={() => openCancelModal(application)}
                  className="w-full rounded-lg bg-red-600 py-2 text-white hover:bg-red-700"
                >
                  Cancel Internship
                </button>
              )}
            </div>
          </div>
        )}

        {/* Status message for processed applications */}
        {isProcessed && (
          <div className="border-t border-slate-200 pt-4">
            <p className="text-sm text-slate-600 text-center">
              {application.status === "completed"
                ? "Internship has been completed and certificate has been generated."
                : application.status === "active" || application.status === "shortlisted"
                  ? "Candidate is currently in active internship."
                  : application.status === "cancelled"
                    ? "Internship has been cancelled."
                  : application.status === "rejected"
                    ? "Candidate has been rejected."
                    : "Application status updated."
              }
            </p>
            {application.status === "cancelled" && application.cancelReason && (
              <p className="mt-2 text-sm text-slate-500 text-center">
                Reason: {application.cancelReason}
              </p>
            )}
          </div>
        )}
      </article>
    );
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 py-10 sm:py-12">
      <div className="mx-auto max-w-6xl px-4">
        <h1 className="mb-8 text-2xl font-bold text-gray-900 sm:text-3xl">Admin Dashboard</h1>

        <div className="mb-6 flex justify-start sm:justify-end">
          <button
            type="button"
            onClick={openWeeklyReportsModal}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            View Weekly Reports
          </button>
        </div>

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-xl">📄</div>
            <p className="text-sm font-medium text-slate-600">Total Applications</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{totalApplications}</p>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 text-xl">⏳</div>
            <p className="text-sm font-medium text-slate-600">Pending</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{pendingCount}</p>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-xl">✅</div>
            <p className="text-sm font-medium text-slate-600">Active</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{activeCount}</p>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-xl">🛑</div>
            <p className="text-sm font-medium text-slate-600">Cancelled</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{cancelledCount}</p>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-xl">❌</div>
            <p className="text-sm font-medium text-slate-600">Rejected</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{rejectedCount}</p>
          </article>
        </section>

        <section className="mb-8 flex flex-wrap gap-3">
          {[
            { key: "pending", label: "Pending", count: pendingApplications.length },
            { key: "active", label: "Active", count: activeApplications.length },
            { key: "cancelled", label: "Cancelled", count: cancelledApplications.length },
            { key: "completed", label: "Completed", count: completedApplications.length }
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white shadow ring-2 ring-blue-200"
                  : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </section>

        <section className="mb-8">
          <label htmlFor="application-search" className="block text-sm font-semibold text-slate-800 mb-2">
            Search by student name or college
          </label>
          <input
            id="application-search"
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Type a name or college..."
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </section>

        {(error || queryError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-300 text-red-700 rounded-lg flex items-center gap-2">
            <span>❌</span>
            <span>{error || queryError?.response?.data?.message || queryError?.message || "Failed to load applications"}</span>
          </div>
        )}

        {loading ? (
          <Spinner />
        ) : tabbedApplications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow p-8">
            <p className="text-gray-600">No applications found for the selected tab</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tabbedApplications.map((application) => renderApplicationCard(application))}
          </div>
        )}

        {cancelModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
              <h2 className="text-xl font-bold text-slate-900">Cancel Internship</h2>
              <p className="mt-2 text-sm text-slate-600">
                {cancelModal.applicationName ? `Application: ${cancelModal.applicationName}` : "Enter the cancellation reason below."}
              </p>

              <label className="mt-4 block text-sm font-medium text-slate-700">Cancel Reason</label>
              <textarea
                value={cancelModal.reason}
                onChange={(event) =>
                  setCancelModal((prev) => ({ ...prev, reason: event.target.value }))
                }
                rows={4}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                placeholder="Explain why this internship is being cancelled"
              />

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={submitCancelInternship}
                  disabled={cancelModal.submitting}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                >
                  {cancelModal.submitting ? "Cancelling..." : "Confirm Cancel"}
                </button>
                <button
                  type="button"
                  onClick={closeCancelModal}
                  disabled={cancelModal.submitting}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {weeklyReportsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
            <div className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-4 sm:px-6 sm:py-5">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Weekly Reports</h2>
                  <p className="mt-1 text-sm text-slate-600">Review and annotate weekly log submissions.</p>
                </div>
                <button
                  type="button"
                  onClick={closeWeeklyReportsModal}
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                >
                  Close
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
                {weeklyLogsLoading ? (
                  <div className="flex h-full items-center justify-center py-20">
                    <Spinner />
                  </div>
                ) : weeklyLogsError ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {weeklyLogsError}
                  </div>
                ) : weeklyLogs.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-14 text-center text-sm text-slate-500">
                    No weekly logs found.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {weeklyLogs.map((log) => {
                      const isExpanded = Boolean(expandedWeeklyLogIds[log._id]);
                      const draft = mentorRemarksDrafts[log._id] ?? log.mentorRemarks ?? "";
                      const application = log.applicationId || {};
                      const student = log.studentId || {};
                      const studentName = student?.name || `${application?.firstName || ""} ${application?.lastName || ""}`.trim() || "Unknown student";

                      return (
                        <article key={log._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                          <button
                            type="button"
                            onClick={() => toggleWeeklyLogExpanded(log._id)}
                            className="flex w-full items-start justify-between gap-4 text-left"
                          >
                            <div>
                              <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">{studentName}</p>
                              <h3 className="mt-1 text-lg font-bold text-slate-900">
                                {formatWeeklyLogDate(log.weekStartDate)} - {formatWeeklyLogDate(log.weekEndDate)}
                              </h3>
                              <p className="mt-2 text-sm text-slate-600">{summarizeWeeklyLog(log)}</p>
                            </div>

                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${log.status === "completed" ? "bg-emerald-100 text-emerald-700" : log.status === "partial" ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-700"}`}>
                              {log.status}
                            </span>
                          </button>

                          {isExpanded && (
                            <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_320px]">
                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tasks</p>
                                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-800">{log.tasksCompleted || "Not available"}</p>
                                </div>
                                <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Achievements</p>
                                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-800">{log.achievements || "Not available"}</p>
                                </div>
                                <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Challenges</p>
                                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-800">{log.challenges || "Not available"}</p>
                                </div>
                                <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Hours</p>
                                  <p className="mt-2 text-sm leading-6 text-slate-800">{typeof log.hoursWorked === "number" ? `${log.hoursWorked} hours` : "Not recorded"}</p>
                                </div>
                              </div>

                              <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Mentor Remarks</label>
                                <textarea
                                  value={draft}
                                  onChange={(event) => updateMentorRemarksDraft(log._id, event.target.value)}
                                  rows={7}
                                  className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                                  placeholder="Add mentor feedback for this week"
                                />

                                <div className="mt-4 flex items-center justify-between gap-3">
                                  <p className="text-xs text-slate-500">
                                    {application?.firstName || application?.lastName ? `${application.firstName || ""} ${application.lastName || ""}`.trim() : ""}
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => saveMentorRemarks(log._id)}
                                    disabled={savingRemarkId === log._id}
                                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                                  >
                                    {savingRemarkId === log._id ? "Saving..." : "Save Remarks"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboardPage;
