import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import API, { setAuthToken } from "../services/api";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";

function ProfilePage() {
  const { user, setUser } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState(user || {
    name: "",
    email: "",
    college: "",
    phone: "",
    skills: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const {
    data: profileData,
    isLoading,
    error: profileError,
    refetch: refetchProfile
  } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      setAuthToken(token);
      const { data } = await API.get("/auth/me");
      return data;
    }
  });

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  useEffect(() => {
    if (!profileData) {
      return;
    }

    setUser((prev) => ({
      ...prev,
      _id: profileData?._id,
      name: profileData?.name,
      email: profileData?.email,
      role: profileData?.role,
      avatarUrl: profileData?.avatarUrl || ""
    }));

    const contact = formatContactDetails(profileData?.contactDetails);
    setFormData({
      name: profileData?.name || "",
      email: profileData?.email || "",
      college: profileData?.college || "",
      phone: profileData?.phone || contact?.phone || "",
      skills: Array.isArray(profileData?.skills) ? profileData.skills.join(", ") : ""
    });
  }, [profileData, setUser]);

  useEffect(() => {
    const message = profileError?.response?.data?.message || profileError?.message;
    if (message) {
      toast.error(message);
    }
  }, [profileError]);

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const formatContactDetails = (contactDetails) => {
    if (!contactDetails) return null;

    if (typeof contactDetails === "string") {
      try {
        return JSON.parse(contactDetails);
      } catch {
        return { phone: contactDetails };
      }
    }

    return contactDetails;
  };

  if (loading) {
    return <Spinner />;
  }

  const error = profileError?.response?.data?.message || profileError?.message || "";

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-8 text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Profile</h2>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={refetchProfile}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg transition-colors hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const contactDetails = formatContactDetails(profileData?.contactDetails);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const getAvatarSrc = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const origin = apiBase.replace(/\/api\/?$/, "");
    return `${origin}${url.startsWith("/") ? url : `/${url}`}`;
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      setAuthToken(token);

      const data = new FormData();
      data.append("avatar", file);

      const response = await API.post("/auth/upload-avatar", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const avatarUrl = response?.data?.avatarUrl || "";

      queryClient.setQueryData(["profile"], (prev) => ({
        ...(prev || {}),
        avatarUrl
      }));

      setUser((prev) => ({
        ...prev,
        avatarUrl
      }));

      toast.success("Profile image updated");
    } catch (err) {
      const message = err.response?.data?.message || "Image upload failed";
      toast.error(message);
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUpdate = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      setAuthToken(token);

      const payload = {
        name: (formData.name || "").trim(),
        college: (formData.college || "").trim(),
        phone: (formData.phone || "").trim(),
        skills: (formData.skills || "")
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean)
      };

      const res = await API.put("/auth/update-profile", payload);
      const data = res.data;

      setUser(res.data);
      queryClient.setQueryData(["profile"], (prev) => ({
        ...(prev || {}),
        ...data
      }));
      queryClient.invalidateQueries({ queryKey: ["profile"] });

      setFormData({
        name: data?.name || "",
        email: data?.email || "",
        college: data?.college || "",
        phone: data?.phone || "",
        skills: Array.isArray(data?.skills) ? data.skills.join(", ") : ""
      });

      setIsEditModalOpen(false);
      toast.success("Profile updated");
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    const contact = formatContactDetails(profileData?.contactDetails);
    setFormData({
      name: profileData?.name || "",
      email: profileData?.email || "",
      college: profileData?.college || "",
      phone: profileData?.phone || contact?.phone || "",
      skills: Array.isArray(profileData?.skills) ? profileData.skills.join(", ") : ""
    });
    setIsEditModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 px-6 py-8 text-gray-800">
            <div className="flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
              <div className="h-24 w-24 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center text-3xl font-bold text-gray-800">
                {profileData?.avatarUrl ? (
                  <img
                    src={getAvatarSrc(profileData.avatarUrl)}
                    alt="Profile avatar"
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(profileData?.name)
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold leading-tight">
                  {profileData?.firstName && profileData?.lastName
                    ? `${profileData.firstName} ${profileData.lastName}`
                    : profileData?.name}
                </h1>
                <span className="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Student
                </span>
                <div className="mt-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    id="profile-avatar-upload"
                  />
                  <label
                    htmlFor="profile-avatar-upload"
                    className="inline-flex cursor-pointer rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-200"
                  >
                    {uploadingAvatar ? "Uploading..." : "Upload Photo"}
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-gray-800">Personal Information</h2>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Edit Profile
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Name</p>
                <p className="text-base font-medium text-gray-800">{profileData?.name || "Not available"}</p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-sm">📧</span>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Email</p>
                </div>
                <p className="text-base font-medium text-gray-800">{profileData?.email || "Not available"}</p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-sm">🎓</span>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">College</p>
                </div>
                <p className="text-base font-medium text-gray-800">{profileData?.college || "Not available"}</p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-sm">📱</span>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Phone</p>
                </div>
                <p className="text-base font-medium text-gray-800">{profileData?.phone || contactDetails?.phone || "Not available"}</p>
              </div>

              <div className="md:col-span-2 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {profileData?.skills?.length ? (
                    profileData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-base font-medium text-gray-800">Not available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-gray-800">Edit Profile</h3>
            <p className="mt-1 text-sm text-gray-500">Update your personal details.</p>

            <div className="mt-6 grid grid-cols-1 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">College</label>
                <input
                  type="text"
                  name="college"
                  value={formData.college || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Skills</label>
                <input
                  type="text"
                  name="skills"
                  placeholder="e.g. React, Node.js, MongoDB"
                  value={formData.skills || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={saving}
                className="rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:bg-blue-300"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;