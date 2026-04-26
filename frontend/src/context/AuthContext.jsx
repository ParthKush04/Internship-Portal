import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { setAuthToken } from "../services/api";

const AuthContext = createContext(null);

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

const buildUser = (data, token) => {
  if (data?._id || data?.email || data?.role) {
    return {
      _id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
      avatarUrl: data.avatarUrl || ""
    };
  }

  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  return {
    _id: payload.id,
    name: payload.name,
    role: payload.role,
    avatarUrl: ""
  };
};

function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      setAuthToken(null);
      return;
    }

    setToken(storedToken);
    setUser(buildUser(null, storedToken));
    setAuthToken(storedToken);
  }, []);

  const login = (authData) => {
    const nextToken = authData?.token;
    if (!nextToken) return;

    localStorage.setItem("token", nextToken);
    setToken(nextToken);
    setUser(buildUser(authData, nextToken));
    setAuthToken(nextToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setAuthToken(null);
  };

  const value = useMemo(
    () => ({
      user,
      setUser,
      token,
      isAuthenticated: Boolean(token),
      login,
      logout
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export { AuthProvider, useAuth };
