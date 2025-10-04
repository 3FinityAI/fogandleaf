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
      const response = await axiosInstance.post("/auth/admin/login", {
        email,
        password,
      }); // Use admin login endpoint

      if (response.data.user?.role !== "admin") {
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

      let errorMessage = "Login failed";

      if (error.code === "ERR_NETWORK") {
        errorMessage =
          "Network Error: Cannot connect to server. Please ensure the backend is running on http://localhost:5000";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      dispatch({ type: "LOGIN_FAILURE", payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch({ type: "LOGOUT" });
    }
  };

  useEffect(() => {
    // Only run auth check once on mount
    const checkAuth = async () => {
      dispatch({ type: "SET_LOADING", payload: true });

      try {
        const response = await axiosInstance.get("/auth/verify-admin");

        if (response.data.user?.role !== "admin") {
          throw new Error("Admin access required");
        }

        dispatch({
          type: "LOGIN_SUCCESS",
          payload: { user: response.data.user, token: null },
        });
      } catch (error) {
        console.error(
          "Initial admin auth check failed:",
          error.response?.status || error.message
        );
        // Don't log this as an error since it's expected for non-authenticated users
        dispatch({ type: "LOGOUT" });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    checkAuth();
  }, []); // Intentionally empty - we only want this to run once on mount

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
