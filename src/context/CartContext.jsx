import React, { createContext, useContext, useEffect, useRef, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [recentlyAddedId, setRecentlyAddedId] = useState(null);

  // ✅ Add-To-Cart Toast
  const [toastMessage, setToastMessage] = useState("");

  // ✅ Loyalty System
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);

  const calculateEarnedPoints = (amount) => Math.floor(amount * 0.02);
  const addLoyaltyPoints = (amount) => {
    const earned = calculateEarnedPoints(amount);
    setLoyaltyPoints((prev) => prev + earned);
    return earned;
  };

  const token = localStorage.getItem("token");
  const rawUser = localStorage.getItem("user");
  const user = rawUser ? JSON.parse(rawUser) : null;
  const userId = user?._id || user?.id;

  const firstLoadDone = useRef(false);
  const getId = (p) => p?.productId || p?._id || p?.id;

  /* ✅ Load cart once */
  useEffect(() => {
    const loadCart = async () => {
      if (!token || !userId) return;

      try {
        const res = await fetch(`http://localhost:5000/api/users/${userId}/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (Array.isArray(data.cart)) {
          const fixedCart = data.cart.map((item) => {
            const pid =
              item.productId ||
              item._id ||
              item.id ||
              `${item.name}-${item.price}`;

            return {
              ...item,
              productId: pid,
              _id: pid,
              id: pid,
            };
          });

          setCartItems(fixedCart);
        }
      } catch (err) {
        console.error("Error loading user cart:", err);
      } finally {
        firstLoadDone.current = true;
      }
    };

    loadCart();
  }, [token, userId]);

  /* ✅ Sync cart to server */
  useEffect(() => {
    const saveCart = async () => {
      if (!token || !userId) return;
      if (!firstLoadDone.current) return;

      try {
        await fetch(`http://localhost:5000/api/users/${userId}/cart`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ cart: cartItems }),
        });
      } catch (err) {
        console.error("Error saving cart:", err);
      }
    };

    saveCart();
  }, [cartItems]);

  /* ✅ Add to Cart (productId enforced + quantity increment fix ✅) */
  const addToCart = (product) => {
    let pid =
      product.productId ||
      product._id ||
      product.id ||
      product.id?._id ||
      null;

    if (!pid) {
      pid = `${product.name}-${product.price}-${Date.now()}`;
      console.warn("⚠️ Product missing ID. Generated ID:", pid);
    }

    const normalizedProduct = {
      ...product,
      productId: pid,
      _id: pid,
      id: pid,
    };

    setCartItems((prev) => {
      const exists = prev.find((i) => i.productId === pid);

      if (exists) {
        // ✅ ✅ FIX — Increase quantity for existing product
        return prev.map((i) =>
          i.productId === pid ? { ...i, quantity: i.quantity + 1 } : i
        );
      }

      // ✅ Trigger toast for new item only
      setToastMessage(product.name);
      setRecentlyAddedId(pid);

      return [...prev, { ...normalizedProduct, quantity: 1 }];
    });
  };

  /* ✅ Remove Qty (fixed productId logic) */
  const removeFromCart = (id) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.productId === id
            ? { ...item, quantity: Math.max(0, item.quantity - 1) }
            : item
        )
        .filter((i) => i.quantity > 0)
    );
  };

  /* ✅ Delete Item (fixed productId logic) */
  const deleteFromCart = (id) => {
    setCartItems((prev) => prev.filter((i) => i.productId !== id));
  };

  /* ✅ Clear Cart */
  const clearCart = async () => {
    setCartItems([]);

    if (!token || !userId) return;

    try {
      await fetch(`http://localhost:5000/api/users/${userId}/cart`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cart: [] }),
      });
    } catch (err) {
      console.error("Error clearing cart:", err);
    }
  };

  const clearCartOnLogout = () => setCartItems([]);

  const totalAmount = cartItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        deleteFromCart,
        clearCart,
        clearCartOnLogout,
        totalAmount,
        recentlyAddedId,
        setRecentlyAddedId,
        toastMessage,
        setToastMessage,

        // ✅ Loyalty
        loyaltyPoints,
        addLoyaltyPoints,
        calculateEarnedPoints,

        isInCart: (id) => cartItems.some((i) => getId(i) === id),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
