// src/components/RatingBadge.jsx
import React from "react";
import RatingStars from "./RatingStars";

/**
 * RatingBadge
 * - avg: Number (avg rating)
 * - count: Number (ratings count)
 *
 * Visual style: pink accent, subtle border
 */
const RatingBadge = ({ avg = 0, count = 0 }) => {
  // ensure we have numbers
  const avgNum = Number(avg) || 0;
  const countNum = Number(count) || 0;

  return (
    <div
      className="bg-white px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2 border border-pink-100"
      style={{ backdropFilter: "blur(4px)" }}
      aria-label={`Rating ${avgNum.toFixed(1)} out of 5 from ${countNum} reviews`}
    >
      <div className="flex items-center -ml-1">
        <RatingStars value={avgNum} size={16} />
      </div>
      <span className="text-sm font-semibold text-pink-600">
        {avgNum.toFixed(1)}
      </span>
      <span className="text-xs text-gray-600">({countNum})</span>
    </div>
  );
};

export default RatingBadge;
