// src/admin/AdminLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api"; // ✅ use central axios instance

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      // ✅ API_BASE automatically handled inside api.js
      const res = await api.post("/api/admin/login", {
        email,
        password,
      });

      const token = res.data?.token;
      if (!token) {
        setMessage("Login failed — no token received.");
        setLoading(false);
        return;
      }

      // Save admin token
      localStorage.setItem("adminToken", token);

      setMessage("Login successful!");
      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Admin Login Error:", err?.response?.data || err.message);
      setMessage(err?.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-sm p-8 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div className="mb-4">
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-2 rounded"
              placeholder="admin@example.com"
              required
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block mb-1 font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-2 rounded"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {message && (
          <p className="text-center mt-4 text-red-500 font-medium">{message}</p>
        )}
      </div>
    </div>
  );
}

export default AdminLogin;
