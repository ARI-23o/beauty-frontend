// src/pages/Favorites.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../api";

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setFavorites([]);
        return;
      }

      // ✅ FIXED: removed API_BASE, use relative path with shared api instance
      const res = await api.get("/api/favorites", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const list = Array.isArray(res.data.favorites)
        ? res.data.favorites
        : [];

      // Normalize images: new backend → images[], image
      const normalized = list.map((p) => {
        const primaryImg =
          Array.isArray(p.images) && p.images.length > 0
            ? p.images[0]
            : p.image || "https://via.placeholder.com/400";

        return {
          ...p,
          _id: p._id || p.id || p.productId,
          primaryImg,
        };
      });

      setFavorites(normalized);
    } catch (err) {
      console.error("Load favorites failed", err);
      toast.error("Failed to load favorites");
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const pid = productId?._id || productId?.id || productId;

      // ✅ FIXED: removed API_BASE, use relative path with api
      await api.delete(`/api/favorites/${pid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Removed from favorites");

      // Refresh list
      await loadFavorites();

      // Notify other components (navbar, etc.)
      window.dispatchEvent(new Event("favorites-changed"));
    } catch (err) {
      console.error("Remove favorite failed", err);
      toast.error("Failed to remove favorite");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Loading favorites...</p>
      </div>
    );

  if (!favorites || favorites.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-6">
        <h2 className="text-2xl font-semibold mb-4">Your Favorites</h2>
        <div className="text-gray-600">
          You have no favorites yet. Browse the{" "}
          <Link to="/shop" className="text-pink-600 underline">
            shop
          </Link>{" "}
          to add favorites.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-16 px-6">
      <h2 className="text-3xl font-semibold mb-6">Your Favorites</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {favorites.map((p) => (
          <div
            key={p._id}
            className="border rounded-lg overflow-hidden bg-white shadow"
          >
            <img
              src={p.primaryImg}
              alt={p.name}
              className="w-full h-44 object-cover"
              onError={(e) =>
                (e.currentTarget.src = "https://via.placeholder.com/400")
              }
            />

            <div className="p-4">
              <h3 className="font-semibold text-lg">{p.name}</h3>

              {p.brand && (
                <p className="text-sm text-gray-500">{p.brand}</p>
              )}

              <p className="text-pink-600 font-semibold mt-2">
                ₹{Number(p.price || 0).toLocaleString("en-IN")}
              </p>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() =>
                    navigate(`/product/${p._id || p.id || p.productId}`)
                  }
                  className="flex-1 border border-gray-300 py-2 rounded"
                >
                  View
                </button>

                <button
                  onClick={() =>
                    removeFavorite(p._id || p.id || p.productId)
                  }
                  className="bg-red-500 text-white px-3 py-2 rounded"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Favorites;
