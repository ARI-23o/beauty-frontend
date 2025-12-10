// src/api.js
import axios from "axios";

const BASE =
  import.meta.env.VITE_API_BASE ||
  "https://beauty-backend-reyn.onrender.com"; // fallback (deployed backend)

const api = axios.create({
  baseURL: BASE,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token automatically if present (for user + admin)
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore
  }
  return config;
});

export default api;
