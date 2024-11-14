import axios from "axios";

const instance = axios.create({
  baseURL: (import.meta.env.VITE_API_URL as string) || "http://localhost:5001",
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
