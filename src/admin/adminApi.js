// src/admin/adminApi.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const adminApi = axios.create({
  baseURL: `${API_BASE}/api`,
});

// Attach admin token on every request
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken"); // IMPORTANT: adminToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default adminApi;
