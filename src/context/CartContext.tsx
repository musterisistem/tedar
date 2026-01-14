import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
    subtotal: number;
    basketDiscount: number;
    qualifyingCount: number;
    isDrawerOpen: boolean;
    openDrawer: () => void;
    closeDrawer: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

import { useProducts } from './ProductContext';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { discountInCartProductIds, basketDiscountRate } = useProducts();
    const [items, setItems] = useState<CartItem[]>(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                return JSON.parse(savedCart);
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
        return [];
    });

    // Save to local storage on change
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);

    const addItem = (item: CartItem) => {
        setItems((prev) => {
            const itemIdStr = item.id.toString();
            const existing = prev.find((i) => i.id.toString() === itemIdStr);
            if (existing) {
                return prev.map((i) =>
                    i.id.toString() === itemIdStr ? { ...i, quantity: i.quantity + item.quantity } : i
                );
            }
            return [...prev, item];
        });
    };

    const removeItem = (id: string | number) => {
        setItems((prev) => prev.filter((i) => i.id.toString() !== id.toString()));
    };

    const updateQuantity = (id: string | number, quantity: number) => {
        if (quantity < 1) {
            removeItem(id);
            return;
        }
        setItems((prev) =>
            prev.map((i) => (i.id.toString() === id.toString() ? { ...i, quantity } : i))
        );
    };

    const clearCart = () => setItems([]);

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Calculate Basket Discount
    const discountIdsStrings = discountInCartProductIds.map(id => id.toString());
    const qualifyingItems = items.filter(item =>
        discountIdsStrings.includes(item.id.toString())
    );
    const qualifyingCount = qualifyingItems.reduce((sum, item) => sum + item.quantity, 0);

    let basketDiscount = 0;
    if (qualifyingCount >= 2) {
        const qualifyingTotal = qualifyingItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        basketDiscount = Math.round(qualifyingTotal * (basketDiscountRate / 100));
    }

    const totalPrice = subtotal - basketDiscount;

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const openDrawer = () => setIsDrawerOpen(true);
    const closeDrawer = () => setIsDrawerOpen(false);

    return (
        <CartContext.Provider value={{
            items, addItem, removeItem, updateQuantity, clearCart,
            totalItems, totalPrice, subtotal, basketDiscount,
            qualifyingCount, isDrawerOpen, openDrawer, closeDrawer
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
