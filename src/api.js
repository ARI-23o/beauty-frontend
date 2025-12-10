// src/api.js
import axios from "axios";

const BASE =
  import.meta.env.VITE_API_BASE ||
  "https://beauty-backend-reyn.onrender.com"; // <-- Render URL fallback

const api = axios.create({
  baseURL: BASE,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token automatically if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
