import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import api from "../api";

const Signup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({ name: "", email: "", mobile: "", password: "" });
  const [otpData, setOtpData] = useState({ emailOTP: "", mobileOTP: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = "Invalid email";
    if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = "Mobile must be 10 digits";
    if (formData.password.length < 6) newErrors.password = "Password must be 6+ characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!/^\d{6}$/.test(otpData.emailOTP)) newErrors.emailOTP = "Enter 6-digit Email OTP";
    if (!/^\d{6}$/.test(otpData.mobileOTP)) newErrors.mobileOTP = "Enter 6-digit Mobile OTP";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!validateStep1()) return;
    try {
      setLoading(true);
      setMessage("");
      // ✅ use shared api instance with baseURL, no hardcoded localhost
      await api.post("/api/auth/request-otp", formData);
      setStep(2);
      setMessage("OTP sent to email and mobile");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    try {
      setLoading(true);
      setMessage("");
      // ✅ use api instance
      const res = await api.post("/api/auth/verify-otp", {
        email: formData.email,
        emailOTP: otpData.emailOTP,
        mobileOTP: otpData.mobileOTP,
      });
      setMessage("Signup successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setLoading(true);
      setMessage("");
      // ✅ use api instance
      await api.post("/api/auth/resend-otp", { email: formData.email });
      setMessage("OTP resent successfully");
      setResendCountdown(60);
      const interval = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) { 
            clearInterval(interval); 
            return 0; 
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form className="bg-white shadow-md rounded-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          {step === 1 ? "Create Account" : "Verify OTP"}
        </h2>

        {step === 1 && (
          <>
            {/* Name */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full border p-2 rounded ${errors.name ? "border-red-500" : ""}`}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full border p-2 rounded ${errors.email ? "border-red-500" : ""}`}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            {/* Mobile */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">Mobile Number</label>
              <input
                type="text"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className={`w-full border p-2 rounded ${errors.mobile ? "border-red-500" : ""}`}
              />
              {errors.mobile && <p className="text-red-500 text-sm">{errors.mobile}</p>}
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full border p-2 rounded ${errors.password ? "border-red-500" : ""}`}
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>

            <button
              onClick={handleSendOTP}
              disabled={loading}
              className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            {/* Email OTP */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">Email OTP</label>
              <input
                type="text"
                value={otpData.emailOTP}
                onChange={(e) => setOtpData({ ...otpData, emailOTP: e.target.value })}
                className={`w-full border p-2 rounded ${errors.emailOTP ? "border-red-500" : ""}`}
              />
              {errors.emailOTP && <p className="text-red-500 text-sm">{errors.emailOTP}</p>}
            </div>

            {/* Mobile OTP */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">Mobile OTP</label>
              <input
                type="text"
                value={otpData.mobileOTP}
                onChange={(e) => setOtpData({ ...otpData, mobileOTP: e.target.value })}
                className={`w-full border p-2 rounded ${errors.mobileOTP ? "border-red-500" : ""}`}
              />
              {errors.mobileOTP && <p className="text-red-500 text-sm">{errors.mobileOTP}</p>}
            </div>

            <button
              onClick={handleVerifyOTP}
              disabled={loading}
              className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition mb-2"
            >
              {loading ? "Verifying OTP..." : "Verify & Signup"}
            </button>

            <button
              onClick={handleResendOTP}
              disabled={resendCountdown > 0 || loading}
              className="w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition"
            >
              {resendCountdown > 0 ? `Resend OTP in ${resendCountdown}s` : "Resend OTP"}
            </button>
          </>
        )}

        {message && <p className="text-center mt-3 text-blue-600">{message}</p>}
      </form>
    </div>
  );
};

export default Signup;
