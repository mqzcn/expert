import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3001";
// todo: set conditionally based on env (dev, prod ...)
const axiosInstance = axios.create({
  baseURL: "/api/proxy",
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers["Content-Type"] = "application/json";
  return config;
});

export default axiosInstance;
