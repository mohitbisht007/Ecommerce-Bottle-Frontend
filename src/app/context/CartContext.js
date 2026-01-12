"use client";
import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) setCartItems(JSON.parse(savedCart));
    }, []);

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product, quantity, color, capacity) => {
        setCartItems((prev) => {
            const existingItem = prev.find(item =>
                item._id === product._id && item.color === color && item.capacity === capacity
            );

            if (existingItem) {
                return prev.map(item =>
                    item === existingItem ? { ...item, quantity: item.quantity + quantity } : item
                );
            }
            return [...prev, { ...product, quantity, color, capacity }];
        });
        setIsCartOpen(true);
    };

    // --- ADD THIS FUNCTION ---
    const updateQuantity = (index, delta) => {
        setCartItems((prev) =>
            prev.map((item, i) => {
                if (i === index) {
                    // Calculate new quantity but don't let it go below 1
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

    const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            isCartOpen,
            setIsCartOpen,
            addToCart,
            clearCart,
            removeFromCart,
            updateQuantity, // --- MAKE SURE THIS IS HERE ---
            cartTotal
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);