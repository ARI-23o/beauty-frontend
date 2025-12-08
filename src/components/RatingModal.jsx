// src/components/RatingModal.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

/**
 * RatingModal
 * props:
 *  - productId
 *  - initialRating (number or null)
 *  - initialComment
 *  - onClose()
 *  - onSaved({ avgRating, ratingsCount, rating })
 *
 * NOTE: Backend endpoint used here is POST /api/ratings/:productId (adjust if your backend uses different route).
 */
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const RatingModal = ({ productId, initialRating = 0, initialComment = "", onClose, onSaved }) => {
  const [selected, setSelected] = useState(initialRating || 0);
  const [comment, setComment] = useState(initialComment || "");
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    setSelected(initialRating || 0);
    setComment(initialComment || "");
  }, [initialRating, initialComment]);

  const handleStarClick = (val) => {
    setSelected(val);
  };

  const submit = async () => {
    if (!token) {
      alert("Please login to submit rating");
      return;
    }
    if (!selected || selected < 1 || selected > 5) {
      alert("Please select a rating between 1 and 5 stars");
      return;
    }
    setSaving(true);
    try {
      const res = await axios.post(
        `${API_BASE}/api/ratings/${productId}`,
        { rating: selected, comment },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );

      // res.data expected to contain update info (adjust depending on backend)
      onSaved && onSaved(res.data);
      onClose && onClose();
    } catch (err) {
      console.error("Failed to submit rating:", err);
      const msg = err?.response?.data?.message || "Failed to submit rating";
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="bg-white rounded-2xl shadow-2xl z-70 w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 text-xl">&times;</button>
        <h3 className="text-xl font-semibold mb-3">Rate this product</h3>

        <div className="mb-4">
          <div className="flex gap-2">
            {[1,2,3,4,5].map((s) => (
              <button
                key={s}
                onClick={() => handleStarClick(s)}
                className={`text-3xl ${selected >= s ? "text-pink-500" : "text-gray-300"} hover:text-pink-500`}
                aria-label={`${s} star`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write a short review (optional)"
          className="w-full border rounded p-3 mb-4 min-h-[80px]"
        />

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
          <button onClick={submit} className="px-4 py-2 rounded bg-pink-600 text-white" disabled={saving}>
            {saving ? "Saving..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
