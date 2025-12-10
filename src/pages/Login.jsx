import React, { useState } from "react";
import { Eye, EyeOff, Mail, Phone, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api";
const Login = () => {
  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  const validateFields = () => {
    const newErrors = {};

    if (!emailOrMobile)
      newErrors.emailOrMobile = "Email or Mobile is required";
    else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrMobile) &&
      !/^\d{10}$/.test(emailOrMobile)
    )
      newErrors.emailOrMobile = "Enter valid email or 10-digit mobile number";

    if (!password) newErrors.password = "Password is required";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const validationErrors = validateFields();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrMobile, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        window.dispatchEvent(new Event("auth-changed"));
        setMessage("✅ Login successful!");

        window.location.href = "/";
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setMessage("⚠️ Something went wrong. Try again later.");
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center bg-gradient-to-b from-pink-50 to-white px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md border border-pink-100"
      >
        <h2 className="text-3xl font-semibold text-center text-pink-600 mb-6">
          Welcome Back 🌸
        </h2>

        {/* Email / Mobile */}
        <div className="mb-5">
          <label className="text-gray-700 font-medium mb-1 block">
            Email or Mobile
          </label>
          <div
            className={`flex items-center border rounded-lg px-4 py-2 ${
              errors.emailOrMobile ? "border-red-500" : "border-gray-300"
            }`}
          >
            {emailOrMobile.includes("@") ? (
              <Mail size={18} className="text-gray-500 mr-2" />
            ) : (
              <Phone size={18} className="text-gray-500 mr-2" />
            )}
            <input
              type="text"
              placeholder="Enter email or 10-digit mobile"
              value={emailOrMobile}
              onChange={(e) => {
                setEmailOrMobile(e.target.value);
                setErrors({ ...errors, emailOrMobile: "" });
              }}
              className="w-full outline-none"
            />
          </div>
          {errors.emailOrMobile && (
            <p className="text-red-500 text-sm mt-1">{errors.emailOrMobile}</p>
          )}
        </div>

        {/* Password */}
        <div className="mb-2">
          <label className="text-gray-700 font-medium mb-1 block">
            Password
          </label>
          <div
            className={`flex items-center border rounded-lg px-4 py-2 ${
              errors.password ? "border-red-500" : "border-gray-300"
            }`}
          >
            <Lock size={18} className="text-gray-500 mr-2" />
            <input
              type={showPass ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors({ ...errors, password: "" });
              }}
              className="w-full outline-none"
            />
            <span
              onClick={() => setShowPass(!showPass)}
              className="cursor-pointer text-gray-500"
            >
              {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        {/* Forgot Password */}
        <div className="flex justify-end mb-6">
          <Link
            to="/forgot-password"
            className="text-pink-600 text-sm hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Button */}
        <button
          type="submit"
          className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-lg font-semibold shadow-md transition"
        >
          Login
        </button>

        {message && (
          <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
        )}
      </form>
    </div>
  );
};

export default Login;
