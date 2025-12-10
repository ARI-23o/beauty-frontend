// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE, // ✅ AUTO SWITCHES URL
  withCredentials: true,
});

export default api;
