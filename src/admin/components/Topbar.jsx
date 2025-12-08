// src/admin/components/Topbar.jsx
import React from "react";
import { FaBell } from "react-icons/fa";

const Topbar = ({ admin, onLogout }) => {
  return (
    <header className="flex items-center justify-between bg-white border-b p-4">
      <div className="flex items-center gap-4">
        <h3 className="text-lg font-medium text-gray-700">Welcome back{admin && `, ${admin.name}`}</h3>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded hover:bg-gray-50">
          <FaBell className="text-gray-600" />
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium leading-none text-white bg-red-500 rounded-full transform translate-x-1/2 -translate-y-1/2">
            3
          </span>
        </button>

        <button onClick={() => { if (typeof onLogout === "function") onLogout(); }} className="px-3 py-2 bg-pink-50 text-pink-600 rounded hover:bg-pink-100">
          Logout
        </button>
      </div>
    </header>
  );
};

export default Topbar;
