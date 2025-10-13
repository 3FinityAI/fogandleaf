import { createContext, useContext, useReducer, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";

const AuthContext = createContext(null);

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_REQUEST":
      return { ...state, loading: true, error: null };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
      };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const loginAdmin = async (email, password) => {
    dispatch({ type: "LOGIN_REQUEST" });

    try {
      // Add timeout and validation for login request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await axiosInstance.post(
        "/auth/admin/login",
        {
          email: email?.trim(),
          password,
        },
        {
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      // Validate response structure
      if (!response.data || !response.data.user) {
        throw new Error("Invalid server response. Please try again.");
      }

      if (response.data.user.role !== "admin") {
        throw new Error("Access denied. Admin privileges required.");
      }

      const { user } = response.data;

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user, token: null }, // No token needed with cookies
      });

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);

      let errorMessage = "Login failed. Please try again.";

      if (error.name === "AbortError") {
        errorMessage =
          "Login request timed out. Please check your connection and try again.";
      } else if (error.code === "ERR_NETWORK") {
        errorMessage = `Network Error: Cannot connect to server. Please ensure the backend is running at ${
          import.meta.env.VITE_BACKEND_URL || "the configured URL"
        }`;
      } else if (error.response?.status === 401) {
        errorMessage =
          "Invalid email or password. Please check your credentials.";
      } else if (error.response?.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message && !error.message.includes("signal")) {
        errorMessage = error.message;
      }

      dispatch({ type: "LOGIN_FAILURE", payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      // Add timeout for logout request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      await axiosInstance.post(
        "/auth/logout",
        {},
        {
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
    } catch (error) {
      // Don't show errors for logout - just log them
      if (error.name === "AbortError") {
        console.warn("Logout request timed out - proceeding with local logout");
      } else {
        console.warn(
          "Logout request failed - proceeding with local logout:",
          error.message
        );
      }
    } finally {
      // Always clear local auth state regardless of server response
      dispatch({ type: "LOGOUT" });
    }
  };

  useEffect(() => {
    // Check auth on mount with improved error handling and timeout
    const checkAuth = async () => {
      dispatch({ type: "SET_LOADING", payload: true });

      try {
        // Add timeout and better error handling for production
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

        const response = await axiosInstance.get("/auth/verify-admin", {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Validate response and user role
        if (!response.data || !response.data.user) {
          throw new Error("Invalid response format");
        }

        if (response.data.user.role !== "admin") {
          throw new Error("Admin access required");
        }

        dispatch({
          type: "LOGIN_SUCCESS",
          payload: { user: response.data.user, token: null },
        });
      } catch (error) {
        // Enhanced error handling for different scenarios
        if (error.name === "AbortError") {
          console.warn("Auth check timed out - assuming not authenticated");
        } else if (error.code === "ERR_NETWORK") {
          console.warn(
            "Network error during auth check - backend may be unavailable"
          );
        } else if (error.response?.status === 401) {
          console.log("Not authenticated - this is expected for new users");
        } else {
          console.error(
            "Auth check failed:",
            error.response?.status || error.message
          );
        }

        // Always logout on any error to ensure clean state
        dispatch({ type: "LOGOUT" });
      } finally {
        // Ensure loading is always set to false
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    // Small delay to prevent flash of loading state
    const timeoutId = setTimeout(checkAuth, 100);

    return () => clearTimeout(timeoutId);
  }, []); // Run only once on mount

  const value = {
    ...state,
    loginAdmin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
