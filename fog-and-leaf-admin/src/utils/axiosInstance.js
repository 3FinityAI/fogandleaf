import axios from "axios";

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
  withCredentials: true, // This allows cookies to be sent with requests
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token if available
axiosInstance.interceptors.request.use(
  (config) => {
    // Add any auth headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 errors more carefully
    if (error.response?.status === 401) {
      const isAuthCall = error.config?.url?.includes("/auth/");
      const isLoginPage = window.location.pathname === "/login";

      // Only redirect if:
      // 1. It's not an auth-related call (login, verify, etc.)
      // 2. We're not already on the login page
      // 3. The call was not aborted (timeout)
      if (!isAuthCall && !isLoginPage && error.name !== "AbortError") {
        console.warn("Unauthorized access - redirecting to login");
        // Use a small delay to prevent conflicts with React Router
        setTimeout(() => {
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }, 100);
      }
    }

    // Handle network errors gracefully
    if (error.code === "ERR_NETWORK") {
      console.warn("Network error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
