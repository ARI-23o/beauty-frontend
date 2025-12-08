import React from "react";
import Sidebar from "./components/Sidebar";

/**
 * AdminLayout
 * - Renders sidebar on the left and content on the right.
 * - Keeps layout consistent and ensures sidebar is visible.
 * - Accepts onLogout callback from children via props (optional).
 */

const AdminLayout = ({ children, onLogout, admin }) => {
  const handleLogout = () => {
    // prefer parent's onLogout if provided
    if (typeof onLogout === "function") {
      onLogout();
    } else {
      localStorage.removeItem("adminToken");
      // default navigation handled by child components
    }
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      {/* Sidebar */}
      <Sidebar onLogout={handleLogout} admin={admin} />

      {/* Main content */}
      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
