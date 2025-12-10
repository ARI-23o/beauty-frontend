// src/pages/Shop.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useCart } from "../context/CartContext";
import ProductQuickView from "../components/ProductQuickView";
import { useNavigate, useLocation } from "react-router-dom";
import AddToCartToast from "../components/AddToCartToast";
import RatingBadge from "../components/RatingBadge";
import { FaTimes, FaHeart } from "react-icons/fa";
import api from "../api";

/**
 * NOTE: local uploaded file path (present in your environment)
 * Use as needed: /mnt/data/1a04eb56-a656-4235-8d9e-03e00d8fe6f3.mp4
 */

const placeholderImg =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial' font-size='18'%3ENo Image%3C/text%3E%3C/svg%3E";

/**
 * ProductCard - moved outside Shop to avoid redefinition on each render.
 */
const ProductCard = React.memo(function ProductCard({
  product,
  onAdd,
  onOpenQuickView,
  onToggleFavorite,
  isFavorited,
  isInCart,
}) {
  const id = product._id || product.id || product.productId || null;
  const cardImage =
    Array.isArray(product?.images) && product.images.length > 0
      ? product.images[0]
      : product?.image || placeholderImg;
  const inCart = isInCart(id);
  const avg = product.avgRating || 0;
  const count = product.ratingsCount || 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 relative">
      <div className="relative">
        <img
          src={cardImage}
          alt={product.name}
          className="w-full h-56 object-cover rounded-t-xl"
          onError={(e) => (e.currentTarget.src = placeholderImg)}
        />
        <div className="absolute left-3 bottom-3">
          <RatingBadge avg={avg} count={count} />
        </div>

        <button
          onClick={() => onToggleFavorite(id)}
          className={`absolute right-3 top-3 p-2 rounded-full ${
            isFavorited(id) ? "bg-pink-50 text-pink-600" : "bg-white text-gray-600 shadow"
          }`}
          title={isFavorited(id) ? "Remove favorite" : "Add to favorites"}
          aria-label={isFavorited(id) ? "Remove favorite" : "Add favorite"}
        >
          <FaHeart />
        </button>
      </div>

      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>

        {product.brand && <p className="text-gray-500 text-sm mt-1">{product.brand}</p>}

        <p className="text-pink-600 font-medium mt-1">
          ₹{Number(product.price || 0).toLocaleString("en-IN")}
        </p>

        <div className="flex justify-center gap-3 mt-3 flex-wrap">
          {!inCart ? (
            <button
              onClick={() => onAdd(product)}
              className="bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600 transition"
            >
              Add to Cart
            </button>
          ) : (
            <button
              disabled
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md cursor-not-allowed"
            >
              Added ✓
            </button>
          )}

          <button
            onClick={() => onOpenQuickView(product)}
            className="border border-pink-500 text-pink-500 px-4 py-2 rounded-md hover:bg-pink-50 transition"
          >
            Quick View
          </button>

          <button
            onClick={() =>
              inCart
                ? window.location.assign("/cart")
                : window.location.assign(`/product/${id}`)
            }
            className="text-sm text-gray-600 underline hover:text-pink-600"
          >
            {inCart ? "Go to Cart" : "View Details"}
          </button>
        </div>
      </div>
    </div>
  );
});

function Shop() {
  const { addToCart, cartItems, recentlyAddedId } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const [favoritesSet, setFavoritesSet] = useState(new Set());

  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [availableFilters, setAvailableFilters] = useState({
    categories: [],
    brands: [],
    priceRanges: [],
  });
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [selectedBrands, setSelectedBrands] = useState(new Set());
  const [selectedPriceRanges, setSelectedPriceRanges] = useState(new Set());

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState(false);
  const [openBrands, setOpenBrands] = useState(false);
  const [openPrices, setOpenPrices] = useState(false);

  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const searchRef = useRef(null);
  const drawerRef = useRef(null);

  const token = localStorage.getItem("token");
  const rawUser = localStorage.getItem("user");
  const user = rawUser ? JSON.parse(rawUser) : null;
  const userId = user?.id || user?._id;

  const capitalizeLabel = (s) => {
    if (!s) return "";
    return s
      .toString()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  };

  // -----------------------------
  //  FETCH PRODUCTS + RATINGS
  // -----------------------------
  useEffect(() => {
    let mounted = true;

    const fetchProducts = async () => {
      try {
        const res = await api.get("/api/products");
        const rawProducts = Array.isArray(res.data) ? res.data : res.data?.products || [];

        const normalizedProducts = rawProducts.map((p) => {
          const images = Array.isArray(p.images) ? p.images : p.images ? [p.images] : [];
          const image = p.image || (images.length ? images[0] : "");
          const normalized = {
            ...p,
            images,
            image,
            _id: p._id || p.id || p.productId || undefined,
          };
          return normalized;
        });

        const productsWithRatings = await Promise.all(
          normalizedProducts.map(async (p) => {
            try {
              const ratingRes = await api.get(`/api/ratings/product/${p._id}`);
              return {
                ...p,
                avgRating: ratingRes.data.avg || 0,
                ratingsCount: ratingRes.data.count || 0,
              };
            } catch {
              return { ...p, avgRating: 0, ratingsCount: 0 };
            }
          })
        );

        if (mounted) {
          setProducts(productsWithRatings);
          setFilteredProducts(productsWithRatings);

          const grouped = productsWithRatings.reduce((acc, p) => {
            const rawCat = (p.category || "uncategorized").toString();
            const key = rawCat.trim().toLowerCase() || "uncategorized";
            if (!acc[key]) acc[key] = { label: capitalizeLabel(rawCat), items: [] };
            acc[key].items.push(p);
            return acc;
          }, {});
          setProductsByCategory(grouped);
        }
      } catch (err) {
        console.error("Product fetch error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      mounted = false;
    };
  }, []);

  // load user's favorites
  const loadFavoritesSet = useCallback(async () => {
    if (!token) {
      setFavoritesSet(new Set());
      return;
    }
    try {
      const res = await api.get("/api/favorites", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const favs = Array.isArray(res.data.favorites)
        ? res.data.favorites.map((f) => f._id || f.id)
        : [];
      setFavoritesSet(new Set(favs));
    } catch (err) {
      console.error("Failed to load favorites:", err);
      setFavoritesSet(new Set());
    }
  }, [token]);

  useEffect(() => {
    loadFavoritesSet();
    const handler = () => loadFavoritesSet();
    window.addEventListener("auth-changed", handler);
    window.addEventListener("favorites-changed", handler);
    return () => {
      window.removeEventListener("auth-changed", handler);
      window.removeEventListener("favorites-changed", handler);
    };
    // eslint-disable-next-line
  }, [loadFavoritesSet]);

  // parse search param from URL -> activeSearch
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const s = q.get("search") || "";
    if (s) {
      setActiveSearch(s.trim());
    } else {
      setActiveSearch("");
    }
    setSearchTerm("");
  }, [location.search]);

  // LOAD FILTERS
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const res = await api.get("/api/filters");
        const payload = res.data || {};
        setAvailableFilters({
          categories: payload.categories || [],
          brands: payload.brands || [],
          priceRanges: payload.priceRanges || [],
        });
      } catch (err) {
        console.warn("Filters load failed, deriving from products", err);
        const cats = [...new Set(products.map((p) => (p.category || "").toString().toLowerCase()))].filter(
          Boolean
        );
        const brs = [...new Set(products.map((p) => (p.brand || "").toString().toLowerCase()))].filter(
          Boolean
        );
        setAvailableFilters({
          categories: cats.map((c) => capitalizeLabel(c)),
          brands: brs.map((b) => capitalizeLabel(b)),
          priceRanges: [
            { label: "Under ₹499", min: 0, max: 499 },
            { label: "₹500 - ₹999", min: 500, max: 999 },
            { label: "₹1000+", min: 1000, max: 999999 },
          ],
        });
      }
    };
    loadFilters();
  }, [products]);

  // SEARCH HISTORY LOAD
  const loadHistory = useCallback(async () => {
    if (!token || !userId) return;
    try {
      const res = await api.get(`/api/search-history/${userId}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const raw = res.data.history || [];
      const list = Array.isArray(raw)
        ? raw
            .map((h) =>
              typeof h === "string"
                ? h
                : h.keyword || h.term || h.search || h.q || ""
            )
            .filter(Boolean)
        : [];

      setHistory(list);
    } catch (err) {
      console.error("Error loading search history:", err);
      setHistory([]);
    }
  }, [token, userId]);

  const clearHistory = useCallback(async () => {
    if (!token || !userId) return;
    try {
      await api.delete(`/api/search-history/${userId}/clear`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory([]);
    } catch (err) {
      console.error("Error clearing search history:", err);
    }
  }, [token, userId]);

  // CLOSE DRAWER / HISTORY ON OUTSIDE CLICK
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowHistory(false);
      if (drawerRef.current && !drawerRef.current.contains(e.target) && drawerOpen)
        setDrawerOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [drawerOpen]);

  // FILTER + SEARCH
  useEffect(() => {
    let list = [...products];
    const term = (activeSearch || "").trim().toLowerCase();
    if (term) {
      list = list.filter((p) =>
        [p.name, p.brand, p.category].some((f) =>
          (f || "").toString().toLowerCase().includes(term)
        )
      );
    }
    if (selectedCategories.size > 0) {
      list = list.filter((p) =>
        selectedCategories.has((p.category || "").toString().toLowerCase())
      );
    }
    if (selectedBrands.size > 0) {
      list = list.filter((p) =>
        selectedBrands.has((p.brand || "").toString().toLowerCase())
      );
    }
    if (selectedPriceRanges.size > 0) {
      const ranges = availableFilters.priceRanges.filter((r) =>
        selectedPriceRanges.has(r.label)
      );
      list = list.filter((p) => {
        const price = Number(p.price || 0);
        return ranges.some((r) => price >= r.min && price <= r.max);
      });
    }
    setFilteredProducts(list);
  }, [
    products,
    activeSearch,
    selectedCategories,
    selectedBrands,
    selectedPriceRanges,
    availableFilters,
  ]);

  // save search to backend
  const saveSearchToBackend = useCallback(
    async (term) => {
      if (!token || !userId || !term.trim()) return;
      try {
        await api.post(
          `/api/search-history/${userId}/add`,
          { keyword: term, term },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error("Error saving search history", err);
      }
    },
    [token, userId]
  );

  const handleSearchSubmit = useCallback(
    async (e) => {
      e?.preventDefault();
      const term = (searchTerm || "").trim();
      if (!term) return;
      await saveSearchToBackend(term);
      navigate(`/shop?search=${encodeURIComponent(term)}`);
      setSearchTerm("");
    },
    [saveSearchToBackend, searchTerm, navigate]
  );

  const selectHistoryItem = useCallback(
    async (term) => {
      await saveSearchToBackend(term);
      navigate(`/shop?search=${encodeURIComponent(term)}`);
      setShowHistory(false);
      setSearchTerm("");
    },
    [saveSearchToBackend, navigate]
  );

  // FILTER TOGGLES
  const toggleCategory = useCallback((c) => {
    const key = c.toString().toLowerCase();
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }, []);

  const toggleBrand = useCallback((b) => {
    const key = b.toString().toLowerCase();
    setSelectedBrands((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }, []);

  const togglePriceRange = useCallback((label) => {
    setSelectedPriceRanges((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setSelectedCategories(new Set());
    setSelectedBrands(new Set());
    setSelectedPriceRanges(new Set());
    setSearchTerm("");
    setFilteredProducts(products);
    setOpenCategories(false);
    setOpenBrands(false);
    setOpenPrices(false);
    setDrawerOpen(false);
  }, [products]);

  const clearActiveSearch = useCallback(() => {
    navigate("/shop");
  }, [navigate]);

  // ADD TO CART
  const handleAdd = useCallback(
    (product) => {
      const pid = product._id || product.id || product.productId;
      if (!pid) return alert("Missing product ID");
      addToCart({ ...product, _id: pid, productId: pid });
    },
    [addToCart]
  );

  const isInCart = useCallback(
    (id) => {
      if (!id) return false;
      return cartItems.some((i) => {
        const iid = i?.productId || i?._id || i?.id || null;
        return iid === id;
      });
    },
    [cartItems]
  );

  const openQuickView = useCallback((p) => {
    setSelectedProduct(p);
    setIsQuickViewOpen(true);
  }, []);

  const closeQuickView = useCallback(() => {
    setSelectedProduct(null);
    setIsQuickViewOpen(false);
  }, []);

  // FAVORITES
  const addFavorite = useCallback(
    async (productId) => {
      if (!token) {
        alert("Please login to add favorites");
        return;
      }
      try {
        await api.post(
          `/api/favorites/${productId}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setFavoritesSet((s) => new Set([...Array.from(s), productId]));
        window.dispatchEvent(new Event("favorites-changed"));
      } catch (err) {
        console.error("Add favorite failed", err);
      }
    },
    [token]
  );

  const removeFavorite = useCallback(
    async (productId) => {
      if (!token) {
        alert("Please login to remove favorites");
        return;
      }
      try {
        await api.delete(`/api/favorites/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavoritesSet((s) => {
          const next = new Set(Array.from(s).filter((x) => x !== productId));
          return next;
        });
        window.dispatchEvent(new Event("favorites-changed"));
      } catch (err) {
        console.error("Remove favorite failed", err);
      }
    },
    [token]
  );

  const toggleFavorite = useCallback(
    (productId) => {
      if (favoritesSet.has(productId)) removeFavorite(productId);
      else addFavorite(productId);
    },
    [favoritesSet, addFavorite, removeFavorite]
  );

  const isFavorited = useCallback(
    (id) => {
      if (!id) return false;
      return favoritesSet.has(id);
    },
    [favoritesSet]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-600">Loading products...</p>
      </div>
    );
  }

  const anyFilter =
    (activeSearch && activeSearch.trim() !== "") ||
    selectedCategories.size > 0 ||
    selectedBrands.size > 0 ||
    selectedPriceRanges.size > 0;

  return (
    <div className="bg-white py-16 px-6 md:px-12">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">
        Explore All Products
      </h1>

      <div className="flex gap-6">
        <div className="flex-1">
          {/* SEARCH BAR */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center w-full md:w-2/3 relative"
              ref={searchRef}
            >
              <input
                type="text"
                value={searchTerm}
                placeholder={
                  activeSearch
                    ? `Showing results for "${activeSearch}"`
                    : "Search by product name, category, or brand..."
                }
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => {
                  loadHistory();
                  setShowHistory(true);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-400"
              />

              {activeSearch ? (
                <button
                  type="button"
                  onClick={clearActiveSearch}
                  title="Clear search"
                  className="absolute right-3 top-3 text-gray-600 hover:text-pink-600"
                >
                  <FaTimes />
                </button>
              ) : (
                <button
                  type="submit"
                  className="ml-3 bg-pink-500 text-white px-4 py-2 rounded-full"
                >
                  Search
                </button>
              )}

              {showHistory && history.length > 0 && (
                <div className="absolute mt-16 bg-white shadow-lg border rounded-xl w-full md:w-2/3 z-[9999]">
                  <div className="flex items-center justify-between px-4 py-2 text-sm text-gray-500">
                    <span>Recent searches</span>
                    <button
                      type="button"
                      onClick={clearHistory}
                      className="text-xs text-pink-600 hover:text-pink-700"
                    >
                      Clear
                    </button>
                  </div>
                  {history.slice(0, 5).map((h, i) => (
                    <div
                      key={i}
                      className="px-4 py-2 hover:bg-pink-50 cursor-pointer"
                      onClick={() => selectHistoryItem(h)}
                    >
                      {h}
                    </div>
                  ))}
                </div>
              )}
            </form>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setDrawerOpen(true)}
                className="bg-white border px-3 py-2 rounded shadow-sm hover:shadow-md"
              >
                Filters
              </button>
              <button
                onClick={clearAllFilters}
                className="bg-gray-100 border px-3 py-2 rounded"
              >
                Clear All
              </button>
            </div>
          </div>

          {activeSearch && (
            <div className="mb-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing results for:{" "}
                <span className="font-semibold text-gray-800">
                  "{activeSearch}"
                </span>
              </div>
              <div>
                <button
                  onClick={clearActiveSearch}
                  className="text-sm text-pink-600 hover:text-pink-700"
                >
                  Clear Search
                </button>
              </div>
            </div>
          )}

          {/* PRODUCTS */}
          {anyFilter ? (
            filteredProducts.length === 0 ? (
              <p className="text-center text-gray-600">No products found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {filteredProducts.map((p) => (
                  <ProductCard
                    key={p._id || p.id}
                    product={p}
                    onAdd={handleAdd}
                    onOpenQuickView={openQuickView}
                    onToggleFavorite={toggleFavorite}
                    isFavorited={isFavorited}
                    isInCart={isInCart}
                  />
                ))}
              </div>
            )
          ) : Object.keys(productsByCategory).length === 0 ? (
            <div className="text-center text-gray-600">
              No products available.
            </div>
          ) : (
            Object.keys(productsByCategory).map((catKey) => (
              <div key={catKey} className="mb-16">
                <h2 className="text-3xl font-semibold mb-6 capitalize">
                  {productsByCategory[catKey]?.label || catKey}
                </h2>
                <div className="flex overflow-x-auto space-x-6 scrollbar-hide pb-2">
                  {productsByCategory[catKey].items.map((p) => (
                    <div key={p._id || p.id} className="min-w-[250px]">
                      <ProductCard
                        product={p}
                        onAdd={handleAdd}
                        onOpenQuickView={openQuickView}
                        onToggleFavorite={toggleFavorite}
                        isFavorited={isFavorited}
                        isInCart={isInCart}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* FILTER DRAWER */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black opacity-50 z-40"
            onClick={() => setDrawerOpen(false)}
          />

          <aside
            ref={drawerRef}
            style={{ width: 300 }}
            className="fixed right-0 top-0 h-full bg-white z-50 shadow-2xl overflow-auto"
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Filters</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-pink-600"
                >
                  Clear
                </button>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="text-sm text-gray-600"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="p-4 space-y-6">
              {/* Categories */}
              <div>
                <div
                  className="flex items-center justify-between mb-2 cursor-pointer py-1"
                  onClick={() => setOpenCategories((v) => !v)}
                >
                  <h4 className="font-medium text-base">Categories</h4>
                  <span className="text-gray-700 text-xl font-bold select-none">
                    {openCategories ? "−" : "+"}
                  </span>
                </div>
                {openCategories && (
                  <div className="space-y-2 max-h-56 overflow-auto pr-2">
                    {availableFilters.categories.length === 0 && (
                      <div className="text-gray-500">No categories</div>
                    )}
                    {availableFilters.categories.map((c) => {
                      const key = (c || "").toString().toLowerCase();
                      return (
                        <label
                          key={c}
                          className="flex items-center gap-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={selectedCategories.has(key)}
                            onChange={() => toggleCategory(c)}
                          />
                          <span className="capitalize">{c}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Brands */}
              <div>
                <div
                  className="flex items-center justify-between mb-2 cursor-pointer py-1"
                  onClick={() => setOpenBrands((v) => !v)}
                >
                  <h4 className="font-medium text-base">Brands</h4>
                  <span className="text-gray-700 text-xl font-bold select-none">
                    {openBrands ? "−" : "+"}
                  </span>
                </div>
                {openBrands && (
                  <div className="space-y-2 max-h-56 overflow-auto pr-2">
                    {availableFilters.brands.length === 0 && (
                      <div className="text-gray-500">No brands</div>
                    )}
                    {availableFilters.brands.map((b) => {
                      const key = (b || "").toString().toLowerCase();
                      return (
                        <label
                          key={b}
                          className="flex items-center gap-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={selectedBrands.has(key)}
                            onChange={() => toggleBrand(b)}
                          />
                          <span className="capitalize">{b}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Price */}
              <div>
                <div
                  className="flex items-center justify-between mb-2 cursor-pointer py-1"
                  onClick={() => setOpenPrices((v) => !v)}
                >
                  <h4 className="font-medium text-base">Price</h4>
                  <span className="text-gray-700 text-xl font-bold select-none">
                    {openPrices ? "−" : "+"}
                  </span>
                </div>
                {openPrices && (
                  <div className="space-y-2">
                    {availableFilters.priceRanges.length === 0 && (
                      <div className="text-gray-500">No price ranges</div>
                    )}
                    {availableFilters.priceRanges.map((r) => (
                      <label
                        key={r.label}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPriceRanges.has(r.label)}
                          onChange={() => togglePriceRange(r.label)}
                        />
                        <span>
                          {r.label}{" "}
                          <span className="text-gray-500">
                            {" "}
                            (₹{r.min} - ₹{r.max})
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>
        </>
      )}

      {/* Quick view */}
      {isQuickViewOpen && selectedProduct && (
        <ProductQuickView
          product={selectedProduct}
          isOpen={isQuickViewOpen}
          onClose={closeQuickView}
        />
      )}

      <AddToCartToast show={!!recentlyAddedId} productName={""} />
    </div>
  );
}

export default Shop;
