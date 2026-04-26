import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api, { setAuthToken } from "../services/api";
import { useAuth } from "../context/AuthContext.jsx";

const initialForm = {
  firstName: "",
  lastName: "",
  college: "",
  internshipPreference: "",
  contactEmail: "",
  contactPhone: "",
  skills: ""
};

function ApplicationFormPage() {
  const { token } = useAuth();
  const [formData, setFormData] = useState(initialForm);
  const [resumeFile, setResumeFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasActiveInternship, setHasActiveInternship] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Check if user has an active internship on component mount
  useEffect(() => {
    const checkActiveInternship = async () => {
      if (!token) {
        setCheckingStatus(false);
        return;
      }

      try {
        setAuthToken(token);
        const response = await api.get("/applications/me/active");
        setHasActiveInternship(response.data.hasActive);
      } catch (error) {
        console.error("Error checking active internship:", error);
        setHasActiveInternship(false);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkActiveInternship();
  }, [token]);

  // Show toast notification if user has active internship
  useEffect(() => {
    if (!checkingStatus && hasActiveInternship) {
      toast.error("You already have an active internship. Complete it before applying again.");
    }
  }, [hasActiveInternship, checkingStatus]);

  const onChange = (event) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onFileChange = (event) => {
    setResumeFile(event.target.files?.[0] || null);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      const message = "Please login first to submit an application.";
      setError(message);
      toast.error(message);
      return;
    }
    if (!resumeFile) {
      const message = "Please upload your resume.";
      setError(message);
      toast.error(message);
      return;
    }

    setLoading(true);
    try {
      setAuthToken(token);
      const payload = new FormData();
      payload.append("firstName", formData.firstName);
      payload.append("lastName", formData.lastName);
      payload.append("college", formData.college);
      payload.append("email", formData.contactEmail);
      payload.append("phone", formData.contactPhone);
      payload.append("skills", formData.skills);
      payload.append("internshipPreference", formData.internshipPreference);
      payload.append(
        "contactDetails",
        JSON.stringify({ email: formData.contactEmail, phone: formData.contactPhone })
      );
      payload.append("resume", resumeFile);

      const response = await api.post("/applications", payload, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      console.log("Success:", response.data);

      setSuccess("Application submitted successfully.");
      toast.success("Application submitted successfully");
      setFormData(initialForm);
      setResumeFile(null);
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
      const message =
        err.response?.data?.message ||
        (err.request ? "Unable to reach server. Check backend and CORS settings." : null) ||
        "Failed to submit application";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 py-12">
      <div className="mx-auto max-w-2xl px-4">
        <div className="bg-white rounded-xl shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Internship Application</h1>
          <p className="text-gray-600 mb-6">Join us at Provisioning Tech - Empowering students with real-world internship opportunities</p>

          {checkingStatus ? (
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : hasActiveInternship ? (
            <div className="p-4 bg-orange-50 border border-orange-300 rounded-lg">
              <p className="text-orange-700 font-medium text-center">
                ⏳ You can apply again after completing your current internship.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={onChange}
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
              <div>
                <input
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={onChange}
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>

            <div>
              <input
                name="college"
                placeholder="College"
                value={formData.college}
                onChange={onChange}
                required
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <select
                name="internshipPreference"
                value={formData.internshipPreference}
                onChange={onChange}
                required
                className="w-full p-3 border rounded-lg border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="">Select Internship Preference</option>
                <option value="MERN Stack">MERN Stack</option>
                <option value="AI/ML">AI/ML</option>
                <option value="Digital Marketing">Digital Marketing</option>
                <option value="Web Development">Web Development</option>
                <option value="App Development">App Development</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  name="contactEmail"
                  type="email"
                  placeholder="Contact Email"
                  value={formData.contactEmail}
                  onChange={onChange}
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
              <div>
                <input
                  name="contactPhone"
                  placeholder="Contact Phone"
                  value={formData.contactPhone}
                  onChange={onChange}
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>

            <div>
              <input
                name="skills"
                placeholder="Skills (comma separated)"
                value={formData.skills}
                onChange={onChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <label className="block">
                <span className="text-sm font-medium text-slate-700 mb-2 block">Upload Resume (.pdf/.doc/.docx)</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={onFileChange}
                  required
                  className="hidden"
                  id="resume-input"
                />
                <label
                  htmlFor="resume-input"
                  className="inline-flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50 cursor-pointer hover:border-blue-500 hover:bg-blue-100 transition-colors"
                >
                  <span className="text-sm text-blue-600 font-medium">
                    {resumeFile ? `📄 ${resumeFile.name}` : "Click to upload or drag and drop"}
                  </span>
                </label>
              </label>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-300 text-red-700 rounded-lg text-sm flex items-center gap-2">
                <span>❌</span>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-300 text-green-700 rounded-lg text-sm flex items-center gap-2">
                <span>✓</span>
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Submit Application"
              )}
            </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ApplicationFormPage;
