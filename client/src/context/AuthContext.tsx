import React, { createContext, useContext, useState, useEffect } from "react";
import { type User } from "../types/index.js";
import { authService } from "../services/auth.service.js";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      try {
        const cachedUser = authService.getCurrentUser();
        if (cachedUser) {
          setUser(cachedUser);
        }
      } catch (err) {
        console.error("Error restoring auth session", err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for forced logout event from axios interceptor
    const handleForcedLogout = () => {
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
    };

    window.addEventListener("auth-logout", handleForcedLogout);
    return () => window.removeEventListener("auth-logout", handleForcedLogout);
  }, []);

  const login = async (credentials: any) => {
    setLoading(true);
    try {
      const result = await authService.login(credentials);
      setUser(result.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
