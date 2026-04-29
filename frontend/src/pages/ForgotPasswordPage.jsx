import { useState } from "react";
import { toast } from "react-toastify";
import api from "../services/api";
import { Link } from "react-router-dom";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      toast.success("If an account exists, a reset link was sent to the email.");
      setEmail("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to request password reset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center px-4 py-10 sm:py-12">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 text-center">Reset Password</h1>
        <p className="text-sm text-gray-600 mb-4">Enter the email associated with your account. We'll send a password reset link.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center justify-between">
            <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-5 py-2.5 text-white font-semibold hover:bg-blue-700">
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
            <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900">Back to login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
