// src/components/ProductQuickView.jsx
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import RatingStars from "./RatingStars";
import axios from "axios";
import { FaPlay, FaHeart, FaTimes } from "react-icons/fa";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const PLACEHOLDER_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'><rect width='100%' height='100%' fill='#f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#9ca3af' font-family='Arial' font-size='20'>No Image</text></svg>`
  );

const ProductQuickView = ({ product, isOpen, onClose }) => {
  const { addToCart, isInCart } = useCart();
  const navigate = useNavigate();

  const productId = product?._id || product?.id || product?.productId || null;

  const imgs =
    Array.isArray(product?.images) && product.images.length > 0
      ? product.images
      : product?.image
      ? [product.image]
      : [];

  const [activeTab, setActiveTab] = useState(imgs.length ? "images" : (product?.video ? "video" : "images"));
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);
  const quickVideoRef = useRef(null);

  const [avg, setAvg] = useState(product?.avgRating ?? 0);
  const [count, setCount] = useState(product?.ratingsCount ?? 0);

  const [favorited, setFavorited] = useState(false);

  // Clean interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Reset when product changes
  useEffect(() => {
    setIndex(0);
    setIsPaused(false);
    setActiveTab(imgs.length ? "images" : (product?.video ? "video" : "images"));
    loadRatings();
    loadFavorited();
    // eslint-disable-next-line
  }, [product?._id, isOpen]);

  // Load ratings
  const loadRatings = async () => {
    if (!productId) return;
    try {
      const res = await axios.get(`${API_BASE}/api/ratings/product/${productId}`);
      setAvg(res.data?.avg ?? 0);
      setCount(res.data?.count ?? 0);
    } catch {
      setAvg(product?.avgRating ?? 0);
      setCount(product?.ratingsCount ?? 0);
    }
  };

  // Load favorites
  const loadFavorited = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return setFavorited(false);

      const res = await axios.get(`${API_BASE}/api/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const favs = Array.isArray(res.data.favorites)
        ? res.data.favorites.map((f) => f._id || f.id)
        : [];

      setFavorited(productId ? favs.includes(productId) : false);
    } catch {
      setFavorited(false);
    }
  };

  // AUTO SCROLL IMAGES
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (activeTab !== "images") return;
    if (!imgs || imgs.length <= 1) return;
    if (isPaused) return;

    intervalRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % imgs.length);
    }, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeTab, imgs, isPaused]);

  // Toggle favorite
  const toggleFavorite = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please login to add favorites");

    try {
      if (!favorited) {
        await axios.post(
          `${API_BASE}/api/favorites/${productId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFavorited(true);
      } else {
        await axios.delete(`${API_BASE}/api/favorites/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavorited(false);
      }

      window.dispatchEvent(new Event("favorites-changed"));
    } catch (err) {
      console.error("Favorite toggle error:", err);
      alert(err?.response?.data?.message || "Failed to update favorite");
    }
  };

  // Add to cart handler
  const handleAdd = () => {
    if (!productId) return alert("Missing product ID");
    addToCart({ ...product, _id: productId, productId });
    onClose && onClose();
  };

  const inCart = isInCart(productId);
  if (!isOpen) return null;

  const imgSrc = imgs[index] || PLACEHOLDER_SVG;

  // play video in-place (replaces image area)
  const playQuickVideo = () => {
    setActiveTab("video");
    setIsPaused(true);
    setTimeout(() => {
      try {
        if (quickVideoRef.current && typeof quickVideoRef.current.play === "function") {
          quickVideoRef.current.play().catch(() => {});
        }
      } catch {}
    }, 120);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden relative">

              {/* Close Button (highest z so it never collides with favorite inside media) */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-gray-700 hover:text-pink-600 text-3xl z-50"
                aria-label="Close quick view"
              >
                <FaTimes />
              </button>

              {/* Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">{product.name}</h2>

                <div className="flex items-center gap-2">
                  <RatingStars value={avg} size={16} />
                  <span className="text-sm text-gray-700">{avg.toFixed(1)}</span>
                  <span className="text-xs text-gray-500">({count})</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2">

                {/* LEFT SIDE */}
                <div className="bg-gray-50 p-4 flex flex-col gap-3">

                  {/* Tabs */}
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => { setActiveTab("images"); setIsPaused(false); }}
                      className={`px-3 py-1 rounded ${activeTab === "images" ? "bg-pink-100 text-pink-600" : "bg-white border"}`}
                    >
                      Images
                    </button>

                    {product.video && (
                      <button
                        onClick={() => { setActiveTab("video"); setIsPaused(true); }}
                        className={`px-3 py-1 rounded ${activeTab === "video" ? "bg-pink-100 text-pink-600" : "bg-white border"}`}
                      >
                        Video
                      </button>
                    )}
                  </div>

                  {/* MAIN IMAGE / VIDEO */}
                  <div className="flex-1 flex items-center justify-center bg-white rounded-lg shadow-sm relative">

                    {/* ❤️ FAVORITE BUTTON IN TOP-RIGHT OF IMAGE (z under modal close) */}
                    <button
                      onClick={toggleFavorite}
                      className={`absolute top-3 right-3 z-40 p-2 rounded-full shadow-md ${favorited ? "bg-pink-100 text-pink-600" : "bg-white text-gray-700"}`}
                      aria-label={favorited ? "Remove favorite" : "Add favorite"}
                    >
                      <FaHeart />
                    </button>

                    {activeTab === "images" ? (
                      <img
                        src={imgSrc}
                        alt={product.name}
                        className="max-h-64 w-full object-contain"
                        onClick={() => setIsPaused(true)}
                        onError={(e) => (e.currentTarget.src = PLACEHOLDER_SVG)}
                      />
                    ) : (
                      /* VIDEO replaces the image area */
                      <div className="relative w-full h-56 bg-black/5 flex items-center justify-center">
                        <div className="w-full max-w-[640px] p-3">
                          <video
                            ref={quickVideoRef}
                            id={`video-player-${productId}`}
                            controls
                            className="w-full h-56 object-contain bg-black rounded"
                            src={product.video}
                            poster={(imgs && imgs[0]) || product.image || ""}
                          />
                        </div>
                      </div>
                    )}

                    {/* If video tab exists and we are showing images, show a central play overlay to hint user */}
                    {activeTab === "images" && product.video && (
                      <button
                        onClick={playQuickVideo}
                        className="absolute z-30 bg-white/90 p-3 rounded-full shadow hover:scale-105 transition"
                        aria-label="Play video"
                      >
                        <FaPlay className="text-lg text-pink-600" />
                      </button>
                    )}
                  </div>

                  {/* Thumbnails */}
                  {activeTab === "images" && imgs.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto mt-2 pb-2">
                      {imgs.map((src, i) => (
                        <button
                          key={i}
                          onClick={() => { setIndex(i); setIsPaused(true); }}
                          className={`border rounded overflow-hidden ${i === index ? "ring-2 ring-pink-400" : ""}`}
                        >
                          <img src={src || PLACEHOLDER_SVG} className="h-16 w-24 object-cover" alt={`thumb-${i}`} />
                        </button>
                      ))}
                    </div>
                  )}

                </div>

                {/* RIGHT SIDE */}
                <div className="p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-800 mb-2">{product.name}</h3>

                    {product.brand && <p className="text-gray-600 text-sm mb-1"><strong>Brand:</strong> {product.brand}</p>}

                    {product.category && <p className="text-gray-600 text-sm mb-3"><strong>Category:</strong> {product.category}</p>}

                    <p className="text-gray-600 text-sm mb-4">{product.description || "A premium beauty product."}</p>

                    <p className="text-pink-600 font-bold text-xl mb-6">₹{Number(product.price || 0).toLocaleString("en-IN")}</p>
                  </div>

                  <div className="flex gap-3">
                    {!inCart ? (
                      <button onClick={handleAdd} className="flex-1 bg-pink-500 text-white py-2 rounded-full hover:bg-pink-600">Add to Cart</button>
                    ) : (
                      <button disabled className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-full cursor-not-allowed">Added ✓</button>
                    )}

                    <button onClick={() => { onClose(); navigate(`/product/${productId}`); }} className="flex-1 border py-2 rounded-full hover:bg-gray-100">View Details</button>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductQuickView;
