"use client";
import { createContext, useContext, useState, useEffect, useRef } from "react";

const CartContext = createContext();

export function getCartItemImage(item) {
    if (!item) return "/placeholder.png";

    const color = String(item.color || "").toLowerCase().trim();
    const variants = item.variants || [];
    const matched = color
        ? variants.find((v) => {
            const names = [v.colorName, v.baseColorName]
                .filter(Boolean)
                .map((n) => String(n).toLowerCase().trim());
            return names.includes(color);
        })
        : null;

    return (
        matched?.images?.[0] ||
        matched?.image ||
        item.image ||
        item.thumbnail ||
        variants[0]?.images?.[0] ||
        "/placeholder.png"
    );
}

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const isMounted = useRef(false); // To prevent overwriting storage on load

    // 1. Load cart on initial mount
    useEffect(() => {
        const savedCart = localStorage.getItem("cart")
        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart));
            } catch (error) {
                console.error("Failed to parse cart:", error);
            }
        }
        isMounted.current = true;
    }, []);

    // 2. Save cart ONLY after initial mount and when cartItems change
    useEffect(() => {
        if (isMounted.current) {
            localStorage.setItem("cart", JSON.stringify(cartItems));
        }
    }, [cartItems]);

    const addToCart = (product, quantity, color, capacity) => {
        setCartItems((prev) => {
            const existingItem = prev.find(item =>
                item._id === product._id && 
                item.color === color && 
                item.capacity === capacity
            );

            if (existingItem) {
                return prev.map(item =>
                    item === existingItem 
                        ? { ...item, quantity: item.quantity + quantity } 
                        : item
                );
            }
            const image = getCartItemImage({ ...product, color, capacity });
            return [...prev, { ...product, quantity, color, capacity, image }];
        });
        setIsCartOpen(true);
    };

    const updateQuantity = (index, delta) => {
        setCartItems((prev) =>
            prev.map((item, i) => {
                if (i === index) {
                    const newQty = Math.max(1, item.quantity + delta);
                    return { ...item, quantity: newQty };
                }
                return item;
            })
        );
    };

    const removeFromCart = (index) => {
        setCartItems(prev => prev.filter((_, i) => i !== index));
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem("cart");
    };

    // Calculate count for the Header badge (e.g., 3 items total)
    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            isCartOpen,
            setIsCartOpen,
            addToCart,
            clearCart,
            removeFromCart,
            updateQuantity,
            cartTotal,
            cartCount // Useful for the little red dot on the cart icon
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);