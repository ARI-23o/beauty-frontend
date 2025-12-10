// src/admin/ProtectedAdminRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

function ProtectedAdminRoute({ children }) {
  const location = useLocation();

  // we wait until we know for sure what localStorage says
  const [ready, setReady] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    // this only runs in the browser (not during build)
    try {
      const token = localStorage.getItem("adminToken");
      setHasToken(!!token);
    } catch (err) {
      console.error("Error reading adminToken from localStorage:", err);
      setHasToken(false);
    } finally {
      setReady(true);
    }
  }, []);

  // While we’re checking localStorage, render nothing (or a tiny loader if you want)
  if (!ready) {
    return null;
    // or: return <div className="p-6 text-center">Loading…</div>;
  }

  // If no token → kick back to /admin login
  if (!hasToken) {
    return (
      <Navigate
        to="/admin"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  // If token exists → show the protected page (dashboard / orders / etc.)
  return children;
}

export default ProtectedAdminRoute;