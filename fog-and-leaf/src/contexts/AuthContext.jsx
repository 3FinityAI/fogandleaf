import React, { createContext, useState, useEffect } from "react";
import axiosInstance from "../utility/axiosInstance";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Check authentication on app load
  useEffect(() => {
    checkAuthStatus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuthStatus = async (retryCount = 0) => {
    let shouldRetry = false;

    try {
      const response = await axiosInstance.get("/auth/verify");
      if (response.data.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        console.log("Auto-login successful:", response.data.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.log("Auth check failed:", error.message);

      // If access token is missing/expired but we have a refresh token, try to refresh
      if (error.response?.status === 401) {
        console.log("Access token expired, attempting refresh...");
        try {
          const refreshResponse = await axiosInstance.post("/auth/refresh");
          if (refreshResponse.data.success) {
            console.log("Token refreshed successfully, retrying auth check...");
            // Token refreshed, try auth check again
            setTimeout(() => checkAuthStatus(0), 100);
            return;
          }
        } catch (refreshError) {
          console.log("Token refresh failed:", refreshError.message);
          // Refresh failed, user needs to log in again
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      // If it's a connection error and we haven't retried too many times, retry
      else if (
        (error.code === "ERR_NETWORK" ||
          error.code === "ERR_CONNECTION_REFUSED") &&
        retryCount < 3
      ) {
        console.log(`Retrying auth check... (attempt ${retryCount + 1})`);
        shouldRetry = true;
        setTimeout(() => {
          checkAuthStatus(retryCount + 1);
        }, 1000 * (retryCount + 1)); // Exponential backoff
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } finally {
      // Only set loading to false if we're not retrying
      if (!shouldRetry) {
        setAuthLoading(false);
      }
    }
  };

  const login = async (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setAuthLoading(false);

    // Note: Cart merge will be handled by CartContext when it detects auth change
  };

  const logout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      // Remove any localStorage tokens if they exist
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
    }
  };

  const value = {
    user,
    isAuthenticated,
    authLoading,
    login,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
