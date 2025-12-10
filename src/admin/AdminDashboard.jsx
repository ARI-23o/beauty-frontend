// src/admin/AdminDashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import StatCard from "./components/StatCard";

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">
          Admin Dashboard
        </h1>

        {/* Quick action buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => navigate("/admin/products")}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium shadow hover:bg-blue-700"
          >
            Manage Products
          </button>
          <button
            onClick={() => navigate("/admin/users")}
            className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium shadow hover:bg-green-700"
          >
            Manage Users
          </button>
          <button
            onClick={() => navigate("/admin/orders")}
            className="px-4 py-2 rounded-lg bg-purple-600 text-white font-medium shadow hover:bg-purple-700"
          >
            Manage Orders
          </button>
          <button
            onClick={() => navigate("/admin/manage-filters")}
            className="px-4 py-2 rounded-lg bg-pink-600 text-white font-medium shadow hover:bg-pink-700"
          >
            Manage Filters
          </button>
          <button
            onClick={() => navigate("/admin/contacts")}
            className="px-4 py-2 rounded-lg bg-orange-500 text-white font-medium shadow hover:bg-orange-600"
          >
            Customer Contacts
          </button>
        </div>

        {/* Example stats row (can be wired to real data later) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard
            title="Total Products"
            value="—"
            subtitle="Connected to your catalog"
          />
          <StatCard
            title="Total Orders"
            value="—"
            subtitle="Completed + pending"
          />
          <StatCard
            title="Registered Users"
            value="—"
            subtitle="All customer accounts"
          />
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">Quick Guide</h2>
          <p className="text-gray-600 text-sm mb-2">
            Use the buttons above or the sidebar to manage products, users,
            orders, filters and customer contact messages.
          </p>
          <p className="text-gray-600 text-sm">
            This dashboard is protected by your{" "}
            <code className="bg-gray-100 px-1 rounded">adminToken</code> stored
            in <code className="bg-gray-100 px-1 rounded">localStorage</code>.
            If you are seeing this page, your admin login is working correctly.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;