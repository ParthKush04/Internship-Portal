import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";
import { useAuth } from "../context/AuthContext.jsx";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function ResetPasswordPage() {
  const query = useQuery();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = query.get("token") || "";
    const e = query.get("email") || "";
    setToken(t);
    setEmail(e);
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/reset-password", { token, password, confirmPassword });
      toast.success("Password reset successful — you are now signed in");
      if (data?.token) login(data);
      navigate("/apply");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center px-4 py-10 sm:py-12">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 text-center">Set New Password</h1>
        <p className="text-sm text-gray-600 mb-4">Set a new password for <strong>{email}</strong></p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center justify-between">
            <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-5 py-2.5 text-white font-semibold hover:bg-blue-700">
              {loading ? "Saving..." : "Set Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
