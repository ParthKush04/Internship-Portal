import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import api, { setAuthToken } from "../services/api";
import Spinner from "../components/Spinner";

const initialFormState = {
  weekStartDate: "",
  tasksCompleted: "",
  achievements: "",
  challenges: "",
  hoursWorked: "",
  status: "pending",
  projectLink: ""
};

const formatDate = (dateValue) => {
  if (!dateValue) return "Not available";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Not available";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const buildSummary = (log) => {
  const tasks = String(log?.tasksCompleted || "").trim();
  const achievements = String(log?.achievements || "").trim();
  const challenges = String(log?.challenges || "").trim();
  const source = tasks || achievements || challenges || "No summary available";

  if (source.length <= 120) {
    return source;
  }

  return `${source.slice(0, 117)}...`;
};

const calculateWeekEndDate = (weekStartDate) => {
  if (!weekStartDate) return null;

  const start = new Date(`${weekStartDate}T00:00:00`);
  if (Number.isNaN(start.getTime())) return null;

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return end;
};

const formatDateDdMmYyyy = (dateValue) => {
  if (!dateValue) return "";
  const date = dateValue instanceof Date ? new Date(dateValue) : new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

function MyWeeklyReportsPage() {
  const [applicationId, setApplicationId] = useState("");
  const [applicationStatus, setApplicationStatus] = useState("");
  const [weeklyLogs, setWeeklyLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(initialFormState);
  const [selectedLog, setSelectedLog] = useState(null);

  const canSubmitReport = useMemo(() => Boolean(applicationId), [applicationId]);
  const derivedWeekStartDate = formData.weekStartDate;
  const derivedWeekEndDate = calculateWeekEndDate(derivedWeekStartDate);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login to view and submit weekly reports.");
        return;
      }

      setLoading(true);
      setError("");

      try {
        setAuthToken(token);
        const { data } = await api.get("/applications/my-application");
        const nextApplicationId = data?.applicationId || "";
        setApplicationId(nextApplicationId);
        setApplicationStatus(String(data?.status || "").toLowerCase());

        if (nextApplicationId) {
          const logsResponse = await api.get(`/weekly-logs/${nextApplicationId}`);
          const logs = Array.isArray(logsResponse.data?.weeklyLogs)
            ? logsResponse.data.weeklyLogs
            : Array.isArray(logsResponse.data)
              ? logsResponse.data
              : [];
          setWeeklyLogs(logs);
        } else {
          setWeeklyLogs([]);
        }
      } catch (err) {
        const message = err.response?.data?.message || "Failed to load weekly reports";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!applicationId) {
      const message = "No internship application found for your account.";
      setError(message);
      toast.error(message);
      return;
    }

    if (!formData.weekStartDate || !formData.tasksCompleted.trim()) {
      const message = "Week start date and tasks completed are required.";
      setError(message);
      toast.error(message);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      setAuthToken(token);

      const payload = {
        applicationId,
        weekStartDate: derivedWeekStartDate,
        tasksCompleted: formData.tasksCompleted,
        achievements: formData.achievements,
        challenges: formData.challenges,
        hoursWorked: formData.hoursWorked === "" ? 0 : Number(formData.hoursWorked),
        status: formData.status,
        projectLink: formData.projectLink
      };

      const { data } = await api.post("/weekly-logs", payload);
      const createdLog = data?.weeklyLog;

      setWeeklyLogs((prev) =>
        createdLog ? [createdLog, ...prev.filter((log) => String(log._id) !== String(createdLog._id))] : prev
      );
      setFormData(initialFormState);
      toast.success("Weekly report submitted successfully");
    } catch (err) {
      const message = err.response?.data?.message || "Failed to submit weekly report";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 px-6 py-8 text-white shadow-xl md:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-200">Weekly tracking</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">My Weekly Reports</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 md:text-base">
            Submit your weekly internship progress, record achievements and blockers, and review previous logs in one place.
          </p>
          {applicationStatus ? (
            <div className="mt-5 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/15">
              Current application status: {applicationStatus}
            </div>
          ) : null}
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        )}

        {loading ? (
          <Spinner />
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Submit Weekly Report</h2>
                  <p className="mt-1 text-sm text-slate-600">Log the progress you made during the week.</p>
                </div>
                <div className="rounded-2xl bg-slate-100 px-4 py-3 text-right">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Reports</p>
                  <p className="text-lg font-bold text-slate-900">{weeklyLogs.length}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Week Start Date</span>
                    <input
                      type="date"
                      name="weekStartDate"
                      value={formData.weekStartDate}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      required
                    />
                    <p className="mt-2 text-xs text-slate-500">The report covers the selected start date plus six days automatically.</p>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Week End Date</span>
                    <input
                      type="text"
                      value={formatDateDdMmYyyy(derivedWeekEndDate)}
                      readOnly
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                    />
                    <p className="mt-2 text-xs text-slate-500">Auto-calculated as six days after the selected Monday.</p>
                  </label>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Tasks Completed</span>
                  <textarea
                    name="tasksCompleted"
                    value={formData.tasksCompleted}
                    onChange={handleChange}
                    rows={4}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    placeholder="Describe the work you completed this week"
                    required
                  />
                </label>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Achievements</span>
                    <textarea
                      name="achievements"
                      value={formData.achievements}
                      onChange={handleChange}
                      rows={4}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      placeholder="Wins, milestones, or completed deliverables"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Challenges</span>
                    <textarea
                      name="challenges"
                      value={formData.challenges}
                      onChange={handleChange}
                      rows={4}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      placeholder="Blockers, questions, or issues encountered"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Hours Worked</span>
                    <input
                      type="number"
                      name="hoursWorked"
                      min="0"
                      step="0.5"
                      value={formData.hoursWorked}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      placeholder="40"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Status</span>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    >
                      <option value="pending">Pending</option>
                      <option value="partial">Partial</option>
                      <option value="completed">Completed</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Project Link</span>
                    <input
                      type="url"
                      name="projectLink"
                      value={formData.projectLink}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      placeholder="https://..."
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !canSubmitReport}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {submitting ? "Submitting..." : "Submit Weekly Report"}
                </button>
              </form>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Previous Logs</h2>
                  <p className="mt-1 text-sm text-slate-600">Review submitted weekly progress entries.</p>
                </div>
              </div>

              {!applicationId ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
                  No internship application is linked to your account yet.
                </div>
              ) : weeklyLogs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                  No weekly reports have been submitted yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {weeklyLogs.map((log) => (
                    <article
                      key={log._id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {formatDate(log.weekStartDate)} - {formatDate(log.weekEndDate)}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">{buildSummary(log)}</p>
                        </div>

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                            log.status === "completed"
                              ? "bg-emerald-100 text-emerald-700"
                              : log.status === "partial"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {log.status}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <p className="text-sm text-slate-600">
                          {typeof log.hoursWorked === "number" ? `${log.hoursWorked} hours worked` : "Hours not recorded"}
                        </p>

                        <button
                          type="button"
                          onClick={() => setSelectedLog(log)}
                          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                        >
                          View Details
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4">
            <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Weekly log details</p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900">
                    {formatDate(selectedLog.weekStartDate)} - {formatDate(selectedLog.weekEndDate)}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                >
                  Close
                </button>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tasks Completed</p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-800">{selectedLog.tasksCompleted || "Not available"}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Achievements</p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-800">{selectedLog.achievements || "Not available"}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Challenges</p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-800">{selectedLog.challenges || "Not available"}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status / Hours</p>
                  <p className="mt-2 text-sm leading-6 text-slate-800">
                    {selectedLog.status} • {typeof selectedLog.hoursWorked === "number" ? `${selectedLog.hoursWorked} hours` : "Hours not available"}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Project Link</p>
                  <p className="mt-2 break-all text-sm text-slate-800">{selectedLog.projectLink || "Not available"}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mentor Remarks</p>
                  <p className="mt-2 whitespace-pre-line text-sm text-slate-800">{selectedLog.mentorRemarks || "Not available"}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyWeeklyReportsPage;