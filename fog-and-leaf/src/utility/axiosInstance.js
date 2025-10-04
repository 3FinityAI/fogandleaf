import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Simple request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Simple response interceptor - no automatic refresh
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Just return the error - let components handle auth failures
    return Promise.reject(error);
  }
);

export default axiosInstance;
