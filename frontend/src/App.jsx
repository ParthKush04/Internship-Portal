import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import PageSkeleton from "./components/PageSkeleton.jsx";
import { useAuth } from "./context/AuthContext.jsx";

const HomePage = lazy(() => import("./pages/HomePage.jsx"));
const LoginPage = lazy(() => import("./pages/LoginPage.jsx"));
const RegisterPage = lazy(() => import("./pages/RegisterPage.jsx"));
const ApplicationFormPage = lazy(() => import("./pages/ApplicationFormPage.jsx"));
const ApplicationDetailsPage = lazy(() => import("./pages/ApplicationDetailsPage.jsx"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage.jsx"));
const ProfilePage = lazy(() => import("./pages/ProfilePage.jsx"));
const MyApplications = lazy(() => import("./pages/MyApplications.jsx"));
const MyWeeklyReportsPage = lazy(() => import("./pages/MyWeeklyReportsPage.jsx"));

function ProtectedRoute({ element }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return element;
}

function RoleRoute({ allowedRole, element }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (user?.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }
  return element;
}

function App() {
  return (
    <div className="bg-white text-gray-900 min-h-screen transition-colors duration-300">
      <ToastContainer position="top-right" autoClose={2000} />
      <Navbar />
      <main className="transition-colors duration-300">
        <Suspense fallback={<PageSkeleton rows={6} />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/apply" element={<ProtectedRoute element={<ApplicationFormPage />} />} />
            <Route path="/applications/:id" element={<ProtectedRoute element={<ApplicationDetailsPage />} />} />
            <Route path="/admin" element={<RoleRoute allowedRole="admin" element={<AdminDashboardPage />} />} />
            <Route path="/profile" element={<ProtectedRoute element={<ProfilePage />} />} />
            <Route path="/my-applications" element={<ProtectedRoute element={<MyApplications />} />} />
            <Route path="/weekly-reports" element={<RoleRoute allowedRole="student" element={<MyWeeklyReportsPage />} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <div className="w-full h-[1px] bg-gray-300 dark:bg-gray-700 my-12"></div>
      <Footer />
    </div>
  );
}

export default App;
