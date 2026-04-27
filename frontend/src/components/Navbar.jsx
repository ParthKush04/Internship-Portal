import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api";

const decodeJwtPayload = (token) => {
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return null;
    const normalized = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser, isAuthenticated, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const navRef = useRef(null);
  const dropdownRef = useRef(null);

  const storedToken = localStorage.getItem("token");
  const tokenPayload = storedToken ? decodeJwtPayload(storedToken) : null;
  const displayName = user?.name || tokenPayload?.name || null;
  const role = user?.role || tokenPayload?.role || null;
  const isAdmin = role === "admin";
  const isLoggedIn = Boolean(storedToken || isAuthenticated);
  const avatarUrl = user?.avatarUrl || "";

  const getAvatarSrc = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const origin = apiBase.replace(/\/api\/?$/, "");
    return `${origin}${url.startsWith("/") ? url : `/${url}`}`;
  };

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 8);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsProfileOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    console.log("Logout triggered");
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    toast.success("Logged out successfully", {
      position: "top-right"
    });
    logout();
    setTimeout(() => {
      navigate("/");
    }, 1000);
  };

  const handleProfileClick = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const fetchPendingCount = async () => {
    try {
      const { data } = await api.get("/applications");
      const count = Array.isArray(data)
        ? data.filter((item) => item?.status === "pending").length
        : 0;
      setPendingCount(count);
    } catch {
      setPendingCount(0);
    }
  };

  const handleMyApplicationsClick = () => {
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    navigate("/my-applications");
  };

  const handleWeeklyReportsClick = () => {
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    navigate("/weekly-reports");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  useEffect(() => {
    if (!isLoggedIn || !isAdmin) {
      setPendingCount(0);
      return;
    }

    fetchPendingCount();
    const intervalId = window.setInterval(fetchPendingCount, 30000);
    return () => window.clearInterval(intervalId);
  }, [isLoggedIn, isAdmin, location.pathname]);

  useEffect(() => {
    const hydrateUserProfile = async () => {
      if (!isLoggedIn || isAdmin) {
        return;
      }

      try {
        const { data } = await api.get("/auth/me");
        setUser((prev) => ({
          ...prev,
          _id: data?._id,
          name: data?.name,
          email: data?.email,
          role: data?.role,
          avatarUrl: data?.avatarUrl || ""
        }));
      } catch {
        // Keep navbar usable even if profile hydration fails.
      }
    };

    hydrateUserProfile();
  }, [isLoggedIn, isAdmin, setUser]);

  return (
    <header
      className={`sticky top-0 z-50 border-b border-gray-200 bg-white/95 text-gray-900 backdrop-blur transition-shadow duration-300 ${
        hasScrolled ? "shadow-md" : "shadow-sm"
      }`}
    >
      <nav ref={navRef} className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <div className="flex h-[72px] items-center justify-between">
          <Link to="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-700 to-indigo-700 text-sm font-bold text-white">
            PT
            </span>
            <span className="truncate text-sm font-bold tracking-tight text-gray-900 sm:text-base md:text-lg">Provisioning Tech</span>
          </Link>

          <div className="hidden items-center gap-4 md:flex md:gap-5">
            {(!isLoggedIn || !isAdmin) && (
              <>
                <Link to="/" className="text-sm font-medium text-gray-700 transition-colors hover:text-indigo-700">
                  Home
                </Link>
                <a href="/#internships" className="text-sm font-medium text-gray-700 transition-colors hover:text-indigo-700">
                  Internships
                </a>
                <a href="/#about" className="text-sm font-medium text-gray-700 transition-colors hover:text-indigo-700">
                  About
                </a>
                <a href="/#contact" className="text-sm font-medium text-gray-700 transition-colors hover:text-indigo-700">
                  Contact
                </a>
              </>
            )}

            {isLoggedIn && isAdmin && (
              <>
                <Link
                  to="/admin"
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-blue-700"
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-blue-700"
                >
                  <span>Applications</span>
                  <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-bold text-yellow-800">
                    {pendingCount}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
                >
                  Logout
                </button>
              </>
            )}

            {isLoggedIn && role === "student" && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleMyApplicationsClick}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-blue-700"
                >
                  My Applications
                </button>
                <button
                  type="button"
                  onClick={handleWeeklyReportsClick}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-blue-700"
                >
                  Weekly Reports
                </button>
              </div>
            )}

            {!isLoggedIn && (
              <Link
                to="/login"
                className="ml-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Login
              </Link>
            )}

            {isLoggedIn && !isAdmin && (
              <div ref={dropdownRef} className="relative ml-1">
                <button
                  type="button"
                  onClick={handleProfileClick}
                  className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-sm font-semibold text-white ring-2 ring-blue-100 transition-transform hover:scale-105"
                  title={displayName || "Profile"}
                >
                  {avatarUrl ? (
                    <img
                      src={getAvatarSrc(avatarUrl)}
                      alt="Profile avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    getInitials(displayName)
                  )}
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white text-gray-900 shadow">
                    <div className="px-4 py-3 text-xs text-gray-500">Signed in as {displayName || "User"}</div>
                    <Link
                      to="/profile"
                      className="block px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      type="button"
                      onClick={handleMyApplicationsClick}
                      className="w-full px-4 py-2.5 text-left text-sm font-medium transition-colors hover:bg-gray-100"
                    >
                      My Applications
                    </button>
                    <button
                      type="button"
                      onClick={handleWeeklyReportsClick}
                      className="w-full px-4 py-2.5 text-left text-sm font-medium transition-colors hover:bg-gray-100"
                    >
                      Weekly Reports
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full border-t border-gray-200 px-4 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            {!isLoggedIn && (
              <Link
                to="/login"
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Login
              </Link>
            )}

            {isLoggedIn && !isAdmin && (
              <Link
                to="/profile"
                className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-xs font-semibold text-white ring-2 ring-blue-100"
                title={displayName || "Profile"}
              >
                {avatarUrl ? (
                  <img
                    src={getAvatarSrc(avatarUrl)}
                    alt="Profile avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getInitials(displayName)
                )}
              </Link>
            )}

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="border-t border-slate-200 pb-4 pt-3 md:hidden">
            <div className="space-y-2">
              {(!isLoggedIn || !isAdmin) && (
                <>
                  <Link to="/" className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">Home</Link>
                  <a href="/#internships" className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">Internships</a>
                  <a href="/#about" className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">About</a>
                  <a href="/#contact" className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">Contact</a>
                </>
              )}

              {isLoggedIn && isAdmin && (
                <>
                  <Link to="/admin" className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Dashboard</Link>
                  <Link to="/admin" className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                    <span>Applications</span>
                    <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-bold text-yellow-800">{pendingCount}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-lg bg-red-50 px-3 py-2 text-left text-sm font-semibold text-red-700"
                  >
                    Logout
                  </button>
                </>
              )}

              {isLoggedIn && role === "student" && (
                <>
                  <Link to="/profile" className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Profile</Link>
                  <button
                    type="button"
                    onClick={handleMyApplicationsClick}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    My Applications
                  </button>
                  <button
                    type="button"
                    onClick={handleWeeklyReportsClick}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Weekly Reports
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-lg bg-red-50 px-3 py-2 text-left text-sm font-semibold text-red-700"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
