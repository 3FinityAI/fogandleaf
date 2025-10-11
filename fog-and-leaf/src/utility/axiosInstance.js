import axios from "axios";

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`, // Replace with 'process.env.REACT_APP_BACKEND_URL'
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
