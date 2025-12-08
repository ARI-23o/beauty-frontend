// src/admin/components/StatCard.jsx
import React from "react";

const StatCard = ({ title, value }) => {
  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-semibold text-gray-800 mt-2">{value}</p>
    </div>
  );
};

export default StatCard;
