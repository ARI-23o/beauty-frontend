import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await api.post(`/api/auth/reset-password/${token}`, { newPassword: password });
      setMessage(res.data?.message || "Password updated.");

      if (res.status === 200 || res.status === 201) {
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err) {
      console.error("Reset password error:", err);
      setMessage("❌ Something went wrong.");
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col justify-center items-center px-4 bg-pink-50">
      <form onSubmit={handleReset} className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md border border-pink-100">
        <h2 className="text-2xl font-semibold text-center text-pink-600 mb-6">Set New Password</h2>

        <input
          type="password"
          placeholder="Enter new password"
          className="w-full border border-gray-300 px-4 py-2 rounded-lg mb-4 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />

        <button type="submit" className="w-full bg-pink-500 text-white py-3 rounded-lg hover:bg-pink-600 transition">Reset Password</button>

        {message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}
      </form>
    </div>
  );
};

export default ResetPassword;
