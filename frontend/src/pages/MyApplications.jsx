import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api, { setAuthToken } from "../services/api";
import Spinner from "../components/Spinner";

const getStatusBadgeColor = (status) => {
  if (!status) return "bg-slate-100 text-slate-700";
  const lower = String(status).toLowerCase();
  if (lower.includes("pending")) return "bg-yellow-100 text-yellow-700";
  if (lower.includes("shortlist")) return "bg-green-100 text-green-700";
  if (lower.includes("active") || lower.includes("ongoing") || lower.includes("extended")) {
    return "bg-blue-100 text-blue-700";
  }
  if (lower.includes("complete")) return "bg-purple-100 text-purple-700";
  if (lower.includes("reject")) return "bg-red-100 text-red-700";
  if (lower.includes("cancel")) return "bg-orange-100 text-orange-700";
  return "bg-slate-100 text-slate-700";
};

const normalizeStatus = (application) => {
  const appStatus = String(application?.status || "").toLowerCase();
  const internshipStatus = String(application?.internship?.status || "").toLowerCase();

  if (appStatus === "completed" || internshipStatus === "completed") {
    return "completed";
  }

  if (appStatus === "rejected") {
    return "rejected";
  }

  if (appStatus === "cancelled") {
    return "cancelled";
  }

  if (appStatus === "shortlisted") {
    return "shortlisted";
  }

  if (appStatus === "active" || internshipStatus === "ongoing" || internshipStatus === "extended") {
    return "ongoing";
  }

  return "pending";
};

const formatDate = (dateValue) => {
  if (!dateValue) return "Not available";
  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) return "Not available";
  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

function MyApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedCards, setExpandedCards] = useState({});
  const [hasActiveInternship, setHasActiveInternship] = useState(false);

  const getFileUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const origin = apiBase.replace(/\/api\/?$/, "");
    return `${origin}${url.startsWith("/") ? url : `/${url}`}`;
  };

  const toggleDetails = (key) => {
    setExpandedCards((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  useEffect(() => {
    const fetchMyApplications = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        const message = "Please login to view your applications.";
        setError(message);
        toast.error(message);
        return;
      }

      setLoading(true);
      setError("");

      try {
        setAuthToken(token);
        const { data } = await api.get("/applications/my-application");

        let normalized = [];
        if (Array.isArray(data)) {
          normalized = data;
        } else if (Array.isArray(data?.applications)) {
          normalized = data.applications;
        } else if (data && (data.status || data.internship || data._id || data.applicationId)) {
          normalized = [data];
        }

        const allowedStatuses = ["pending", "shortlisted", "active", "ongoing", "completed", "rejected", "cancelled"];
        const filteredApplications = normalized.filter((item) => {
          const status = String(item?.status || "").toLowerCase();
          return allowedStatuses.includes(status);
        });
        
        setApplications(filteredApplications);

        // Check if user has an active internship
        const hasActive = filteredApplications.some((app) => {
          const status = String(app?.status || "").toLowerCase();
          return status === "shortlisted" || status === "ongoing";
        });
        setHasActiveInternship(hasActive);
      } catch (err) {
        const message = err.response?.data?.message || "Failed to load your applications";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyApplications();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 py-10 sm:py-12">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="mb-6 text-2xl font-bold text-gray-800 sm:text-3xl">My Applications</h1>

        {error && (
          <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">{error}</div>
        )}

        {loading ? (
          <Spinner />
        ) : applications.length === 0 ? (
          <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-8 text-center">
            <p className="text-gray-500">You have not applied for any internships yet</p>
            <button
              type="button"
              onClick={() => navigate("/apply")}
              disabled={hasActiveInternship}
              className={`mt-4 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${
                hasActiveInternship
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed opacity-60"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {hasActiveInternship ? "Already Enrolled in Internship" : "Apply Now"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((application, index) => (
              (() => {
                const status = normalizeStatus(application);
                console.log(application.status);
                const internship = application?.internship || {};
                const title = internship?.title || application?.internshipDomain || "Internship Program";
                const hasStartDate = Boolean(internship?.startDate);
                const hasDuration = Boolean(internship?.duration);
                const hasEndDate = Boolean(internship?.endDate);
                const showTimeline = status === "shortlisted" || status === "ongoing";
                const showRejectedMessage = status === "rejected";
                const showCancelledMessage = status === "cancelled";
                const showCompletionMessage = status === "completed";
                const hasTimelineData = hasStartDate || hasDuration || hasEndDate;
                const cardKey = application._id || application.applicationId || index;
                const applicationId = application?._id || application?.applicationId;
                const isExpanded = Boolean(expandedCards[cardKey]);
                const certificateUrl = getFileUrl(application?.certificateUrl);
                const internshipType = application?.assignedInternship || "Not assigned";

                return (
                  <article
                    key={cardKey}
                    className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-base font-semibold text-gray-800">{title}</h2>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusBadgeColor(status)}`}
                      >
                        {status}
                      </span>
                    </div>

                    <div className="mt-2">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm inline-block">
                        {internshipType}
                      </span>
                    </div>

                    {status === "ongoing" && (
                      <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
                        Active Internship
                      </div>
                    )}

                    {showTimeline && isExpanded && hasTimelineData && (
                      <div className="mt-4 rounded-lg p-4 ring-1 bg-gray-50 ring-gray-200">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          {hasStartDate && (
                            <div>
                              <p className="text-xs font-medium text-gray-500">Start Date</p>
                              <p className="mt-1 text-sm font-semibold text-gray-800">{formatDate(internship.startDate)}</p>
                            </div>
                          )}
                          {hasDuration && (
                            <div>
                              <p className="text-xs font-medium text-gray-500">Duration</p>
                              <p className="mt-1 text-sm font-semibold text-gray-800">{internship.duration}</p>
                            </div>
                          )}
                          {hasEndDate && (
                            <div>
                              <p className="text-xs font-medium text-gray-500">End Date</p>
                              <p className="mt-1 text-sm font-semibold text-gray-800">{formatDate(internship.endDate)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {showCompletionMessage && (
                      <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">
                        Internship Completed Successfully
                      </div>
                    )}

                    {showRejectedMessage && (
                      <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                        Application Rejected
                      </div>
                    )}

                    {showCancelledMessage && (
                      <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700">
                        Internship Cancelled
                        {application?.cancelReason ? (
                          <p className="mt-1 text-xs font-normal text-orange-700/90">
                            Reason: {application.cancelReason}
                          </p>
                        ) : null}
                        {application?.cancelledAt ? (
                          <p className="mt-1 text-xs font-normal text-orange-700/90">
                            Cancelled on {formatDate(application.cancelledAt)}
                          </p>
                        ) : null}
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {showTimeline && (
                        <button
                          type="button"
                          onClick={() => toggleDetails(cardKey)}
                          className="inline-flex items-center rounded-lg border border-gray-300 bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                        >
                          {isExpanded ? "Hide Timeline" : "Toggle Timeline"}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => navigate(`/applications/${applicationId}`)}
                        disabled={!applicationId}
                        className="inline-flex items-center rounded-lg border border-gray-300 bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
                      >
                        View Details
                      </button>

                      {showCancelledMessage && (
                        <button
                          type="button"
                          onClick={() => navigate("/apply")}
                          className="inline-flex items-center rounded-lg bg-orange-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-orange-700"
                        >
                          Apply Again
                        </button>
                      )}

                      {showCompletionMessage && (
                        <button
                          onClick={() => {
                            const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
                            const origin = apiBase.replace(/\/api\/?$/, "");
                            window.open(`${origin}/api/certificate/${applicationId}`, "_blank");
                          }}
                          className="inline-flex items-center rounded-lg bg-green-600 text-white px-3 py-1.5 text-sm font-medium transition-colors hover:bg-green-700"
                        >
                          Download Certificate
                        </button>
                      )}
                    </div>
                  </article>
                );
              })()
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyApplications;
