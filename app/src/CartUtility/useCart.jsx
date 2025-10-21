import { useState, useEffect } from "react";

import { fetchCart } from "../QueryHooks/Cart";
import { cartEmitter } from "./cartEmitter";
export const useCart = () => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    // Load cart initially
    const fetchCart = async () => {
      const savedCart = await fetchCart();
      setCart(savedCart);
    };
    fetchCart();

    // Listen for updates
    const handler = (newCart) => setCart(newCart);
    cartEmitter.on("cartChanged", handler);

    // Cleanup
    return () => cartEmitter.off("cartChanged", handler);
  }, []);

  return cart;
};
