import { useState, useEffect } from "react";
import API from "../utils/axios.util";
import toast from "react-hot-toast";
import { AuthContext } from "./AuthContext.js";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      // You can add a /me endpoint later to verify token
      // For now, we'll just check if token exists in cookies
      setLoading(false);
    } catch {
      setUser(null);
      setLoading(false);
    }
  };

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const register = async (name, email, password) => {
    try {
      const response = await API.post("/api/auth/register", {
        name,
        email,
        password,
      });

      if (response.data.success) {
        setUser(response.data.user);
        toast.success("Registration successful!");
        return { success: true, user: response.data.user };
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "Registration failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await API.post("/api/auth/login", {
        email,
        password,
      });

      if (response.data.success) {
        setUser(response.data.user);
        if (response.data.user.role === "admin") {
          toast.success("Logged in as Admin", {
            duration: 3000,
          });
        } else {
          toast.success("Login successful!");
        }
        return { success: true, user: response.data.user };
      }
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await API.post("/api/auth/logout");
      setUser(null);
      toast.success("Logged out successfully");
    } catch {
      toast.error("Logout failed");
    }
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

