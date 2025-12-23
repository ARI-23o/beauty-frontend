// src/api.js
import axios from "axios";

const BASE =
  import.meta.env.VITE_API_BASE ||
  "https://beauty-backend-reyn.onrender.com";

const api = axios.create({
  baseURL: BASE,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ SINGLE interceptor (NOT nested)
api.interceptors.request.use(
  (config) => {
    const isAdminRoute = config.url?.includes("/api/admin");

    const adminToken = localStorage.getItem("adminToken");
    const userToken = localStorage.getItem("token");

    const token = isAdminRoute ? adminToken : userToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
