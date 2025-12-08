import React from "react";
import {
  FaTachometerAlt,
  FaBoxOpen,
  FaUsers,
  FaSignOutAlt,
  FaShoppingBag,
  FaFilter,
  FaClipboardList,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * Sidebar
 * - Larger clickable areas
 * - Added Manage Filters link with pink accent
 * - Kept other existing links (Products, Users, Orders)
 * - Exposes onLogout callback from parent
 */

const Sidebar = ({ onLogout, admin }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { key: "dashboard", label: "Dashboard", icon: <FaTachometerAlt />, to: "/admin/dashboard" },
    { key: "products", label: "Products", icon: <FaBoxOpen />, to: "/admin/products" },
    { key: "orders", label: "Orders", icon: <FaClipboardList />, to: "/admin/orders" },
    { key: "users", label: "Users", icon: <FaUsers />, to: "/admin/users" },
    { key: "filters", label: "Filters", icon: <FaFilter />, to: "/admin/manage-filters" },
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-pink-500 to-rose-400 text-white flex flex-col p-6 space-y-6 shadow-xl min-h-screen">
      <div className="flex items-center gap-3">
        <div className="text-2xl font-bold tracking-wide">BeautyE</div>
        <div className="text-xs uppercase tracking-wider font-semibold ml-auto">Admin</div>
      </div>

      <nav className="flex flex-col gap-2 mt-6">
        {items.map((it) => {
          const active = location.pathname.startsWith(it.to);
          return (
            <button
              key={it.key}
              onClick={() => navigate(it.to)}
              className={`flex items-center gap-3 text-left px-3 py-2 rounded-lg transition-colors w-full ${
                active ? "bg-white/10" : "hover:bg-white/5"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <span className="text-lg">{it.icon}</span>
              <span className="font-medium">{it.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className="text-sm text-white/80 mb-3">
          {admin ? <div>{admin.name}</div> : <div>Admin</div>}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="bg-white/10 text-white px-3 py-2 rounded-lg hover:bg-white/20 w-full"
          >
            <FaTachometerAlt className="inline mr-2" />
            Home
          </button>
        </div>

        <button
          onClick={onLogout}
          className="mt-4 w-full bg-white text-pink-600 font-semibold px-3 py-2 rounded-lg hover:bg-white/90 transition"
        >
          <FaSignOutAlt className="inline mr-2" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
