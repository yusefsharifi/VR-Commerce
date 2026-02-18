import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [shopId, setShopId] = useState(null);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      const { items, shopId: savedShopId } = JSON.parse(savedCart);
      setCart(items);
      setShopId(savedShopId);
    }
  }, []);

  const saveCart = (items, currentShopId) => {
    setCart(items);
    setShopId(currentShopId);
    localStorage.setItem(
      "cart",
      JSON.stringify({ items, shopId: currentShopId }),
    );
  };

  const addToCart = (product, currentShopId) => {
    if (shopId && shopId !== currentShopId) {
      if (!confirm("You have items from another shop. Clear cart?")) return;
      saveCart([{ ...product, quantity: 1 }], currentShopId);
    } else {
      const existing = cart.find((item) => item.id === product.id);
      if (existing) {
        saveCart(
          cart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
          currentShopId,
        );
      } else {
        saveCart([...cart, { ...product, quantity: 1 }], currentShopId);
      }
    }
  };

  const removeFromCart = (productId) => {
    const newCart = cart.filter((item) => item.id !== productId);
    saveCart(newCart, newCart.length === 0 ? null : shopId);
  };

  const clearCart = () => {
    saveCart([], null);
  };

  return (
    <CartContext.Provider
      value={{ cart, shopId, addToCart, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
