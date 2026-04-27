import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api";

function RegisterPage() {
	const navigate = useNavigate();
	const { login } = useAuth();
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		role: "student"
	});
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const onChange = (event) => {
		setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
	};

	const onSubmit = async (event) => {
		event.preventDefault();
		setError("");
		setLoading(true);
		try {
			const { data } = await api.post("/auth/register", formData);
			login(data);
			navigate("/apply");
		} catch (err) {
			setError(err.response?.data?.message || "Registration failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-white text-gray-900 flex items-center justify-center px-4 py-10 sm:py-12">
			<div className="bg-white rounded-xl shadow p-6 sm:p-8 max-w-md w-full">
				<h1 className="text-2xl font-bold text-gray-900 mb-6 text-center sm:text-3xl">Register</h1>

				<form onSubmit={onSubmit} className="space-y-4">
					<div>
						<input
							name="name"
							placeholder="Full Name"
							value={formData.name}
							onChange={onChange}
							required
							className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
						/>
					</div>

					<div>
						<input
							name="email"
							type="email"
							placeholder="Email"
							value={formData.email}
							onChange={onChange}
							required
							className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
						/>
					</div>

					<div>
						<input
							name="password"
							type="password"
							placeholder="Password"
							value={formData.password}
							onChange={onChange}
							required
							className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
						/>
					</div>

					<div>
						<select
							name="role"
							value={formData.role}
							onChange={onChange}
							className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
						>
							<option value="student">Student</option>
							<option value="admin">Admin</option>
						</select>
					</div>

					{error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>}

					<button
						type="submit"
						disabled={loading}
						className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors flex items-center justify-center"
					>
						{loading ? (
							<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
						) : (
							"Register"
						)}
					</button>
				</form>

				<p className="text-center text-gray-600 text-sm mt-6">
					Already have an account?{" "}
					<Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
						Login
					</Link>
				</p>
			</div>
		</div>
	);
}

export default RegisterPage;
