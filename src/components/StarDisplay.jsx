import React from "react";

/**
 * Displays stars (filled/empty) for a numeric rating
 * props:
 *  - rating: number (e.g. 4.2)
 *  - size: number (pixel size of icon / font-size)
 *  - showCount: optional number to show (like "(12)")
 */
const StarDisplay = ({ rating = 0, size = 14, showCount = null }) => {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  const stars = [];
  for (let i = 0; i < full; i++) stars.push("full");
  if (half) stars.push("half");
  for (let i = 0; i < empty; i++) stars.push("empty");

  const starStyle = { fontSize: `${size}px`, lineHeight: 1 };

  return (
    <div className="inline-flex items-center gap-1">
      {stars.map((s, i) => (
        <span key={i} style={starStyle} aria-hidden>
          {s === "full" ? "★" : s === "half" ? "☆" : "☆"}
        </span>
      ))}
      {typeof showCount === "number" && (
        <span className="text-sm text-gray-600 ml-1">({showCount})</span>
      )}
    </div>
  );
};

export default StarDisplay;
