// src/pages/ProductDetail.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import axios from "axios";
import RatingStars from "../components/RatingStars";
import api from "../api";

const PLACEHOLDER = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='500'><rect width='100%' height='100%' fill='%23f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-family='Arial' font-size='20'>No Image</text></svg>`
)}`;

function ProductDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();

  // product + loading + ratings
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratingData, setRatingData] = useState({ avg: 0, count: 0, reviews: [] });

  // gallery related states
  const images =
    Array.isArray(product?.images) && product.images.length > 0
      ? product.images
      : product?.image
      ? [product.image]
      : [];
  const [activeTab, setActiveTab] = useState("images"); // "images" | "video"
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);
  const videoRef = useRef(null);

  // favorite state: determine via GET /api/favorites
  const [favorited, setFavorited] = useState(false);

  // normalize product id
  const pid = product?._id || product?.id || product?.productId || id;

  // initial data fetch
  useEffect(() => {
    let mounted = true;

    const fetch = async () => {
      try {
        // ✅ removed API_BASE — use relative path with shared api instance
        const res = await api.get(`/api/products/${id}`);
        const p = res.data || null;
        if (p) {
          // normalize rating fields if older schema used
          p.avgRating = Number(p.avgRating ?? p.ratingAvg ?? p.avg ?? 0);
          p.ratingsCount = Number(p.ratingsCount ?? p.ratingCount ?? p.ratingsCount ?? 0);
        }
        if (mounted) setProduct(p);
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const loadRatings = async () => {
      try {
        // ✅ removed API_BASE
        const r = await api.get(`/api/ratings/product/${id}`);
        if (mounted) setRatingData(r.data || { avg: 0, count: 0, reviews: [] });
      } catch (err) {
        // ignore rating load errors
      }
    };

    fetch();
    loadRatings();

    return () => {
      mounted = false;
    };
  }, [id]);

  // check if product is favorited by current user (via GET /api/favorites)
  const checkFavorited = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setFavorited(false);
        return;
      }
      // ✅ removed API_BASE
      const res = await api.get(`/api/favorites`, { headers: { Authorization: `Bearer ${token}` } });
      const favs = Array.isArray(res.data.favorites)
        ? res.data.favorites.map((f) => f._id || f.id || f.productId)
        : [];
      setFavorited(pid ? favs.includes(pid) : false);
    } catch (err) {
      setFavorited(false);
    }
  };

  // reset gallery & favorited when product changes
  useEffect(() => {
    setActiveIndex(0);
    setIsPaused(false);
    setActiveTab(
      images && images.length ? "images" : product && product.video ? "video" : "images"
    );
    checkFavorited();
    // eslint-disable-next-line
  }, [product?._id]);

  // auto-scroll effect for images
  useEffect(() => {
    // clear previous interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // only auto-scroll when images tab active
    if (activeTab !== "images") return;
    if (!images || images.length <= 1) return;
    if (isPaused) return;

    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [activeTab, images, isPaused]);

  // when switching to video, ensure auto-scroll stops
  useEffect(() => {
    if (activeTab === "video") {
      setIsPaused(true);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [activeTab]);

  // play video when user chooses play overlay or selects video tab (and auto-play is desired)
  const handlePlayVideo = () => {
    setActiveTab("video");
    setIsPaused(true);
    // wait for video element to mount, then attempt play
    setTimeout(() => {
      try {
        if (videoRef.current && typeof videoRef.current.play === "function") {
          videoRef.current.play().catch(() => {
            /* autoplay may be blocked — user can press play */
          });
        }
      } catch {}
    }, 120);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-600">Loading product...</p>
      </div>
    );
  }
  if (!product) return null;

  // ---------------------------
  // Basic actions & helpers
  // ---------------------------
  const inCart = isInCart(pid);

  const handleAdd = () => {
    if (inCart) return;
    addToCart({ ...product, _id: pid, productId: pid });
  };

  const mainSrc =
    images && images.length ? images[activeIndex] : product.image || PLACEHOLDER;

  const handleThumbClick = (i) => {
    setActiveIndex(i);
    setIsPaused(true);
  };

  // Toggle favorite using existing POST/DELETE endpoints
  const toggleFavorite = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to add favorites");
        return;
      }
      if (!pid) return;

      if (!favorited) {
        // ✅ removed API_BASE
        await api.post(
          `/api/favorites/${pid}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFavorited(true);
      } else {
        // ✅ removed API_BASE
        await api.delete(`/api/favorites/${pid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavorited(false);
      }
      window.dispatchEvent(new Event("favorites-changed"));
    } catch (err) {
      console.error("Toggle favorite failed", err);
      alert(err?.response?.data?.message || "Failed to update favorite");
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-16 px-6 md:px-12 grid md:grid-cols-2 gap-12 items-start">
      {/* ===========================
          LEFT SECTION
          =========================== */}
      <div className="flex gap-6">
        {/* Thumbnails (Desktop) */}
        <div className="hidden md:flex flex-col gap-3 w-28">
          {images && images.length ? (
            images.map((u, i) => (
              <button
                key={i}
                onClick={() => handleThumbClick(i)}
                className={`rounded overflow-hidden ${
                  i === activeIndex ? "ring-2 ring-pink-400" : ""
                }`}
                aria-label={`Thumbnail ${i + 1}`}
              >
                <img
                  src={u || PLACEHOLDER}
                  alt={`thumb-${i}`}
                  className="h-20 w-full object-cover"
                  onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
                />
              </button>
            ))
          ) : (
            <div className="h-20 w-full bg-gray-100 rounded" />
          )}
        </div>

        {/* MAIN IMAGE + VIDEO SECTION */}
        <div className="flex-1">
          {/* Tabs (Images / Video) */}
          <div className="mb-4 flex items-center gap-2">
            <button
              onClick={() => setActiveTab("images")}
              className={`px-3 py-1 rounded ${
                activeTab === "images"
                  ? "bg-pink-100 text-pink-600"
                  : "bg-white border"
              }`}
            >
              Images
            </button>

            {product.video && (
              <button
                onClick={() => {
                  setActiveTab("video");
                  setIsPaused(true);
                }}
                className={`px-3 py-1 rounded ${
                  activeTab === "video"
                    ? "bg-pink-100 text-pink-600"
                    : "bg-white border"
                }`}
              >
                Video
              </button>
            )}
          </div>

          {/* MAIN IMAGE / VIDEO WRAPPER */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden relative">
            {/* ❤️ FAVORITE BUTTON – on top-right of main media */}
            <button
              onClick={toggleFavorite}
              className={`absolute top-3 right-3 z-30 p-3 rounded-full ${
                favorited
                  ? "bg-pink-50 text-pink-600"
                  : "bg-white text-gray-700 shadow"
              }`}
              title={favorited ? "Remove favorite" : "Add favorite"}
              aria-label={favorited ? "Remove favorite" : "Add favorite"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
              >
                <path
                  d={
                    favorited
                      ? "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 3.99 4 6.5 4c1.74 0 3.41.81 4.5 2.09C12.59 4.81 14.26 4 16 4 18.51 4 20.5 6 20.5 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                      : "M16 4c-1.54 0-3.04.99-3.57 2.36h-1.87C11.04 4.99 9.54 4 8 4 5.51 4 3.5 6 3.5 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l.95-.81C17.1 15.36 20.5 12.28 20.5 8.5 20.5 6 18.49 4 16 4z"
                  }
                />
              </svg>
            </button>

            {/* IMAGE TAB */}
            {activeTab === "images" ? (
              <div className="relative w-full max-w-[620px] mx-auto">
                <img
                  src={mainSrc || PLACEHOLDER}
                  alt={product.name}
                  className="w-full h-[437px] object-cover"
                  onClick={() => setIsPaused(true)}
                  onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
                />
              </div>
            ) : (
              /* VIDEO TAB */
              <div className="relative bg-black/5 flex items-center justify-center h_[560px]">
                <div className="w-full max-w-[900px] p-6">
                  <video
                    ref={videoRef}
                    controls
                    className="w-full h-[520px] object-contain bg-black rounded"
                    src={product.video}
                    poster={(images && images[0]) || product.image || ""}
                  />
                </div>
              </div>
            )}
          </div>

          {/* MOBILE THUMBNAILS BELOW */}
          {images && images.length > 0 && (
            <div className="mt-3 md:hidden flex gap-2 overflow-x-auto">
              {images.map((u, i) => (
                <button
                  key={i}
                  onClick={() => handleThumbClick(i)}
                  className={`flex-shrink-0 ${
                    i === activeIndex ? "ring-2 ring-pink-400" : ""
                  }`}
                >
                  <img
                    src={u || PLACEHOLDER}
                    alt={`mthumb-${i}`}
                    className="h-20 w-28 object-cover rounded"
                    onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* =======================================
          RIGHT SECTION — PRODUCT INFO
      ======================================== */}
      <div>
        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>

        {/* Rating Summary */}
        <div className="flex items-center gap-4 mb-4">
          <RatingStars value={ratingData.avg || 0} size={20} />
          <div className="text-sm text-gray-600">
            {ratingData.avg
              ? `${ratingData.avg.toFixed(1)} out of 5`
              : "No rating yet"}{" "}
            • {ratingData.count || 0} review(s)
          </div>
        </div>

        {/* Brand */}
        {product.brand && (
          <p className="text-gray-600 text-lg mb-2">
            <span className="font-semibold text-gray-800">Brand:</span>{" "}
            {product.brand}
          </p>
        )}

        {/* Category */}
        {product.category && (
          <p className="text-gray-600 text-lg mb-2 capitalize">
            <span className="font-semibold text-gray-800">Category:</span>{" "}
            {product.category}
          </p>
        )}

        {/* Price */}
        <p className="text-pink-600 text-3xl font-semibold mb-4">
          ₹{Number(product.price).toLocaleString("en-IN")}
        </p>

        {/* Description */}
        <p className="text-gray-700 mb-6 leading-relaxed whitespace-pre-line">
          {product.description || "No description available for this product yet."}
        </p>

        {/* ACTIONS */}
        <div className="flex gap-4 mb-8">
          {!inCart ? (
            <button
              onClick={handleAdd}
              className="bg-pink-500 text-white px-6 py-3 rounded-md text-lg hover:bg-pink-600 transition"
            >
              Add to Cart
            </button>
          ) : (
            <button
              disabled
              className="bg-gray-300 text-gray-700 px-6 py-3 rounded-md text-lg cursor-not-allowed"
            >
              Added ✓
            </button>
          )}

          <button
            onClick={() => navigate(inCart ? "/cart" : "/shop")}
            className="border border-pink-500 text-pink-500 px-6 py-3 rounded-md text-lg hover:bg-pink-50 transition"
          >
            {inCart ? "Go to Cart" : "Back to Shop"}
          </button>
        </div>

        {/* REVIEWS */}
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-3">Customer Reviews</h3>

          {!ratingData.reviews || ratingData.reviews.length === 0 ? (
            <div className="text-gray-500">
              No reviews yet — be the first to rate!
            </div>
          ) : (
            <div className="space-y-4">
              {ratingData.reviews.map((r) => (
                <div
                  key={r._id || r.id}
                  className="bg-white p-4 rounded shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">
                      {r.reviewerName || "Customer"}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-2">
                    <RatingStars value={r.rating} size={16} />
                    <div className="text-sm text-gray-700 font-semibold">
                      {r.rating}/5
                    </div>
                  </div>

                  {r.comment && (
                    <div className="text-gray-700">{r.comment}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
