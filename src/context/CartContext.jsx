import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import api from "../api";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [recentlyAddedId, setRecentlyAddedId] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
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

  useEffect(() => {
    const loadCart = async () => {
      if (!token || !userId) {
        firstLoadDone.current = true;
        return;
      }

      try {
        const res = await api.get(`/api/users/${userId}/cart`);
        const data = res.data || {};
        const rawCart = data.cart || data || [];

        if (Array.isArray(rawCart)) {
          const fixedCart = rawCart.map((item) => {
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
              quantity: item.quantity || 1,
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

  useEffect(() => {
    const saveCart = async () => {
      if (!token || !userId) return;
      if (!firstLoadDone.current) return;

      try {
        await api.put(`/api/users/${userId}/cart`, { cart: cartItems });
      } catch (err) {
        console.error("Error saving cart:", err);
      }
    };

    saveCart();
  }, [cartItems, token, userId]);

  const addToCart = (product) => {
    let pid = product.productId || product._id || product.id || null;

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
        return prev.map((i) =>
          i.productId === pid ? { ...i, quantity: (i.quantity || 1) + 1 } : i
        );
      }

      setToastMessage(product.name);
      setRecentlyAddedId(pid);

      return [...prev, { ...normalizedProduct, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.productId === id
            ? { ...item, quantity: Math.max(0, (item.quantity || 1) - 1) }
            : item
        )
        .filter((i) => (i.quantity || 0) > 0)
    );
  };

  const deleteFromCart = (id) => {
    setCartItems((prev) => prev.filter((i) => i.productId !== id));
  };

  const clearCart = async () => {
    setCartItems([]);

    if (!token || !userId) return;

    try {
      await api.put(`/api/users/${userId}/cart`, { cart: [] });
    } catch (err) {
      console.error("Error clearing cart:", err);
    }
  };

  const clearCartOnLogout = () => setCartItems([]);

  const totalAmount = cartItems.reduce(
    (sum, i) => sum + (i.price || 0) * (i.quantity || 0),
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
export default CartContext;
