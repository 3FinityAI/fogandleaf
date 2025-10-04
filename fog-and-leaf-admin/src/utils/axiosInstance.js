import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api",
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
    // Only redirect to login if it's not the initial auth verification call
    if (error.response?.status === 401) {
      const isAuthVerification =
        error.config?.url?.includes("/auth/verify-admin");

      if (!isAuthVerification) {
        // Handle unauthorized access for other API calls
        console.error("Unauthorized access - redirecting to login");
        window.location.href = "/login";
      }
      // For auth verification calls, just let the error pass through
      // so AuthContext can handle it properly
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
