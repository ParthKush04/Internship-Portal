import { useEffect, useState } from "react";
import api, { setAuthToken } from "../services/api";
import Spinner from "../components/Spinner";

function StatusTrackingPage() {
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStatusData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login as student to view status.");
        return;
      }

      setLoading(true);
      setError("");
      try {
        setAuthToken(token);
        const { data } = await api.get("/applications/my-application");
        setStatusData(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch statuses");
      } finally {
        setLoading(false);
      }
    };

    fetchStatusData();
  }, []);

  const getStatusBadgeColor = (status) => {
    if (!status) return "bg-gray-200 text-gray-800";
    const lower = status.toLowerCase();
    if (lower.includes("pending")) return "bg-yellow-500 text-white";
    if (lower.includes("shortlist") || lower.includes("accepted")) return "bg-green-500 text-white";
    if (lower.includes("reject")) return "bg-red-500 text-white";
    if (lower.includes("completed") || lower.includes("active")) return "bg-blue-500 text-white";
    if (lower.includes("cancel")) return "bg-orange-500 text-white";
    return "bg-slate-500 text-white";
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "Not assigned yet";
    return new Date(dateValue).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const applicationStatus = statusData?.status;
  const internship = statusData?.internship;

  return (
    <div className="min-h-screen bg-white text-gray-900 py-12">
      <div className="mx-auto max-w-6xl px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Status Tracking</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-300 text-red-700 rounded-lg flex items-center gap-2">
            <span>❌</span>
            <span>{error}</span>
          </div>
        )}

        {loading && <Spinner />}

        {!loading && !error && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Application Status Card */}
            <article className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Status</h3>
              {applicationStatus ? (
                <>
                  <span
                    className={`inline-block px-4 py-2 rounded-lg font-medium text-sm ${getStatusBadgeColor(applicationStatus)}`}
                  >
                    {applicationStatus}
                  </span>
                  <p className="text-2xl font-bold text-gray-700 mt-4">{applicationStatus}</p>
                  {String(applicationStatus).toLowerCase() === "cancelled" && statusData?.cancelReason && (
                    <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
                      Reason: {statusData.cancelReason}
                      {statusData.cancelledAt ? (
                        <div className="mt-1 text-xs text-orange-700">
                          Cancelled on {formatDate(statusData.cancelledAt)}
                        </div>
                      ) : null}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-600">No application found</p>
              )}
            </article>

            {/* Internship Details Card */}
            <article className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Internship Details</h3>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="font-medium text-gray-500">Start Date</span>
                  <span>{formatDate(internship?.startDate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-500">End Date</span>
                  <span>{formatDate(internship?.endDate)}</span>
                </div>
              </div>
            </article>
          </div>
        )}
      </div>
    </div>
  );
}

export default StatusTrackingPage;
