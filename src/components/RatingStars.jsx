// src/components/RatingStars.jsx
import React from "react";

/**
 * Props:
 *  - value: number (0..5) average rating (can be float)
 *  - size: number (pixel for svg width/height)
 *
 * Renders up to 5 stars — filled pink for the integer part, supports simple half display by filling one star if >= .5
 */
const RatingStars = ({ value = 0, size = 18 }) => {
  const v = Math.max(0, Math.min(5, Number(value) || 0));
  const full = Math.floor(v);
  const hasHalf = v - full >= 0.5;
  const empty = 5 - full - (hasHalf ? 1 : 0);

  const star = (fill, key) => (
    <svg
      key={key}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill ? "#E91E63" : "none"}
      stroke="#E91E63"
      strokeWidth="1.2"
      className="drop-shadow-sm"
    >
      <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.788 1.402 8.178L12 18.896 4.664 23.176l1.402-8.178L.132 9.21l8.2-1.192z" />
    </svg>
  );

  const stars = [];
  for (let i = 0; i < full; i++) stars.push(star(true, `f-${i}`));
  if (hasHalf) {
    // simple half: show filled star (visually acceptable). Could implement clipping for exact half later.
    stars.push(star(true, "half"));
  }
  for (let i = 0; i < empty; i++) stars.push(star(false, `e-${i}`));

  return <div className="flex items-center gap-0.5">{stars.map((s, i) => <span key={i}>{s}</span>)}</div>;
};

export default RatingStars;
