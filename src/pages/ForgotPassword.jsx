import React, { useState } from "react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgot = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setMessage(data.message);
    } catch (err) {
      setMessage("❌ Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-[70vh] flex flex-col justify-center items-center px-4 bg-pink-50">
      <form
        onSubmit={handleForgot}
        className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md border border-pink-100"
      >
        <h2 className="text-2xl font-semibold text-center text-pink-600 mb-6">
          Reset Password
        </h2>

        <p className="text-gray-600 text-sm mb-4">
          Enter your registered email. We’ll send you a reset link.
        </p>

        <input
          type="email"
          placeholder="Enter email"
          className="w-full border border-gray-300 px-4 py-2 rounded-lg mb-4 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-pink-500 text-white py-3 rounded-lg hover:bg-pink-600 transition disabled:bg-pink-300"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        {message && (
          <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
        )}
      </form>
    </div>
  );
};

export default ForgotPassword;
