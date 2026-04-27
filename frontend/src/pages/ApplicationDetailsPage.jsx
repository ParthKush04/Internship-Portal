import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api, { setAuthToken } from "../services/api";
import Spinner from "../components/Spinner";

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

function ApplicationDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: application,
    isLoading: loading,
    error: queryError
  } = useQuery({
    queryKey: ["application", id],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please login to view application details.");
      }

      setAuthToken(token);
      const { data } = await api.get(`/applications/${id}`);
      return data;
    },
    enabled: Boolean(id)
  });

  const getFileUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const origin = apiBase.replace(/\/api\/?$/, "");
    return `${origin}${url.startsWith("/") ? url : `/${url}`}`;
  };

  const error = useMemo(() => queryError?.response?.data?.message || queryError?.message || "", [queryError]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const normalizedStatus = String(application?.status || "").toLowerCase();
  const internship = application?.internship || {};
  const certificateUrl = getFileUrl(application?.certificateUrl);
  const title = internship?.title || application?.internshipDomain || application?.assignedInternship || "Internship Program";

  return (
    <div className="min-h-screen bg-white text-gray-900 py-10 sm:py-12">
      <div className="mx-auto max-w-3xl px-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back
        </button>

        {error && (
          <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">{error}</div>
        )}

        {loading ? (
          <Spinner />
        ) : application ? (
          <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-md sm:p-6">
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{title}</h1>

            <p className="mt-2 text-sm text-slate-600">
              Status: <span className="font-semibold capitalize">{normalizedStatus || "pending"}</span>
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-slate-500">Start Date</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{formatDate(internship?.startDate || application?.startDate)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Duration</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{internship?.duration || application?.duration || "Not available"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">End Date</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{formatDate(internship?.endDate || application?.endDate)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Internship Type</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{application?.assignedInternship || "Not assigned"}</p>
              </div>
            </div>

            {normalizedStatus === "completed" && (
              <div className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                Internship completed successfully.
              </div>
            )}

            {normalizedStatus === "completed" && (
              <button
                type="button"
                onClick={() => {
                  if (!certificateUrl) {
                    toast.info("Certificate will be available soon.");
                    return;
                  }
                  window.open(certificateUrl, "_blank", "noopener,noreferrer");
                }}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                Download Certificate
              </button>
            )}

            {normalizedStatus === "cancelled" && (
              <div className="mt-6 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
                Internship was cancelled.
                {application?.cancelReason ? (
                  <div className="mt-1">Reason: {application.cancelReason}</div>
                ) : null}
                {application?.cancelledAt ? (
                  <div className="mt-1">Cancelled on {formatDate(application.cancelledAt)}</div>
                ) : null}
              </div>
            )}
          </article>
        ) : null}
      </div>
    </div>
  );
}

export default ApplicationDetailsPage;
