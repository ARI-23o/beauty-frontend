import React from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";

/**
 * AdminDashboard
 * - Uses AdminLayout so the Sidebar is visible.
 * - Adds a "Manage Filters" button (pink theme per request).
 */

function AdminDashboard() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin");
  };

  return (
    <AdminLayout>
      <div className="p-10">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>

        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => navigate("/admin/products")}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
          >
            Manage Products
          </button>

          <button
            onClick={() => navigate("/admin/users")}
            className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition"
          >
            Manage Users
          </button>

          <button
            onClick={() => navigate("/admin/orders")}
            className="bg-purple-600 text-white px-4 py-2 rounded shadow hover:bg-purple-700 transition"
          >
            Manage Orders
          </button>

          {/* Pink themed Manage Filters button (per your choice B) */}
          <button
            onClick={() => navigate("/admin/manage-filters")}
            className="bg-pink-600 text-white px-4 py-2 rounded shadow hover:bg-pink-700 transition"
          >
            Manage Filters
          </button>
        </div>

        <div className="mt-6">
          <button
            onClick={logout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>

        <div className="mt-10 text-sm text-gray-600">
          <p>
            Quick links: use the buttons above to manage products, users, orders
            and filters. The &quot;Manage Filters&quot; page lets you edit categories,
            brands and price ranges that the Shop uses for filtering.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
