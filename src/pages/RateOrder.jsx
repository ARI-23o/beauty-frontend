// src/pages/RateOrder.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import RatingStars from "../components/RatingStars";

// ❌ Vite does NOT support process.env
// const API_BASE = process.env.REACT_APP_API_BASE;

// ✅ Correct Vite version (with fallback)
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const RateOrder = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [orderInfo, setOrderInfo] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  // ---------------------------
  // Validate Rating Token
  // ---------------------------
  useEffect(() => {
    const validate = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/ratings/validate/${token}`);
        setOrderInfo(res.data);
      } catch (err) {
        console.error("Invalid rating token:", err);
        setMessage(err?.response?.data?.message || "Invalid or expired rating link");
      } finally {
        setLoading(false);
      }
    };
    if (token) validate();
  }, [token]);

  // ---------------------------
  // Submit Rating
  // ---------------------------
  const submitRating = async (e) => {
    e.preventDefault();
    if (!orderInfo) return;
    setSubmitting(true);

    try {
      const res = await axios.post(`${API_BASE}/api/ratings/submit`, {
        token,
        rating,
        comment,
      });

      setMessage(res.data?.message || "Thanks for your feedback!");

      // redirect after delay
      setTimeout(() => navigate("/"), 2500);
    } catch (err) {
      console.error("Submit rating failed:", err);
      setMessage(err?.response?.data?.message || "Failed to submit rating");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------
  // UI: Loading / Error States
  // ---------------------------
  if (loading) {
    return <div className="p-10 text-center">Validating your rating link...</div>;
  }

  if (!orderInfo) {
    return (
      <div className="p-10 text-center text-red-600">
        {message || "Invalid link"}
      </div>
    );
  }

  // ---------------------------
  // UI: Rating Form
  // ---------------------------
  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Rate your order</h1>

      <p className="mb-4 text-sm text-gray-600">
        Order: <strong>{orderInfo.orderId}</strong> — rating will apply to all items in
        this order.
      </p>

      <form onSubmit={submitRating} className="bg-white p-6 rounded-lg shadow">
        {/* Rating */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Your rating</label>

          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className={`p-1 rounded ${
                    n <= rating ? "bg-pink-50" : "bg-transparent"
                  }`}
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill={n <= rating ? "#E91E63" : "none"}
                    stroke="#E91E63"
                    strokeWidth="1.2"
                  >
                    <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.788 1.402 8.178L12 18.896 4.664 23.176l1.402-8.178L.132 9.21l8.2-1.192z" />
                  </svg>
                </button>
              ))}
            </div>

            <div className="text-sm text-gray-600">
              You selected <strong>{rating}</strong> star(s)
            </div>
          </div>
        </div>

        {/* Comment */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Your comment (optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full border rounded p-2"
          ></textarea>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 items-center">
          <button
            disabled={submitting}
            type="submit"
            className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
          >
            {submitting ? "Submitting…" : "Submit Rating"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-sm text-gray-600"
          >
            Cancel
          </button>
        </div>

        {message && (
          <div className="mt-4 text-sm text-gray-700">{message}</div>
        )}
      </form>

      <div className="mt-6 text-sm text-gray-500">
        This rating will be applied to all products in this order.  
        Thank you — we appreciate your feedback!
      </div>
    </div>
  );
};

export default RateOrder;
