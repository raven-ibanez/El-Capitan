import { useState, useCallback } from 'react';
import { CartItem, MenuItem, Variation, AddOn } from '../types';

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const calculateItemPrice = (item: MenuItem, variation?: Variation, addOns?: AddOn[]) => {
    let price = item.basePrice;
    if (variation) {
      price += variation.price;
    }
    if (addOns) {
      addOns.forEach(addOn => {
        price += addOn.price;
      });
    }
    return price;
  };

  const addToCart = useCallback((item: MenuItem, quantity: number = 1, variation?: Variation, addOns?: AddOn[]) => {
    const totalPrice = calculateItemPrice(item, variation, addOns);

    // Group add-ons by name and sum their quantities
    const groupedAddOns = addOns?.reduce((groups, addOn) => {
      const existing = groups.find(g => g.id === addOn.id);
      if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
      } else {
        groups.push({ ...addOn, quantity: 1 });
      }
      return groups;
    }, [] as (AddOn & { quantity: number })[]);

    setCartItems(prev => {
      // Create a unique ID for this item including its customization
      const uniqueId = `${item.id}-${variation?.id || 'default'}-${addOns?.map(a => a.id).sort().join(',') || 'none'}`;

      const existingIndex = prev.findIndex(cartItem => cartItem.id === uniqueId);

      if (existingIndex >= 0) {
        const existingItem = prev[existingIndex];
        const newQuantity = existingItem.quantity + quantity;

        // Enforce stock limit
        const stockLimit = variation?.trackInventory
          ? variation.stockQuantity ?? Infinity
          : (item.trackInventory ? item.stockQuantity ?? Infinity : Infinity);

        if (newQuantity > stockLimit) {
          alert(`Insufficient stock. Only ${stockLimit} available.`);
          return prev;
        }

        return prev.map((cartItem, idx) =>
          idx === existingIndex
            ? { ...cartItem, quantity: newQuantity }
            : cartItem
        );
      } else {
        // Enforce stock limit for new item
        const stockLimit = variation?.trackInventory
          ? variation.stockQuantity ?? Infinity
          : (item.trackInventory ? item.stockQuantity ?? Infinity : Infinity);

        if (quantity > stockLimit) {
          alert(`Insufficient stock. Only ${stockLimit} available.`);
          return prev;
        }

        return [...prev, {
          ...item,
          id: uniqueId,
          quantity,
          selectedVariation: variation,
          selectedAddOns: groupedAddOns || [],
          totalPrice
        }];
      }
    });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCartItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          // Enforce stock limit
          const stockLimit = item.selectedVariation?.trackInventory
            ? item.selectedVariation.stockQuantity ?? Infinity
            : (item.trackInventory ? item.stockQuantity ?? Infinity : Infinity);

          if (quantity > stockLimit) {
            return item; // Don't update if exceeds stock
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const getTotalPrice = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.totalPrice * item.quantity), 0);
  }, [cartItems]);

  const getTotalItems = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  return {
    cartItems,
    isCartOpen,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getTotalItems,
    openCart,
    closeCart
  };
};