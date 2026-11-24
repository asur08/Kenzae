import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { KenzaeProduct } from '../types/catalog';
import { CartItem, TailoringSelection, ShippingAddress, CartTotals, ShippingTier } from '../types/cart';
import { INTERNATIONAL_EXPRESS_SHIPPING_INR } from '../data/countries';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: KenzaeProduct, tailoring: TailoringSelection, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, newQty: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  shippingAddress: ShippingAddress;
  setShippingAddress: React.Dispatch<React.SetStateAction<ShippingAddress>>;
  totals: CartTotals;
  isItemInCart: (productId: string) => boolean;
}

const STORAGE_KEY_CART = 'kenzae_boutique_cart_v1';
const STORAGE_KEY_ADDRESS = 'kenzae_boutique_shipping_v1';
const KERALA_FREE_SHIPPING_THRESHOLD = 2500;
const KERALA_STANDARD_SHIPPING = 100;
const INTERSTATE_SHIPPING = 200;

const defaultAddress: ShippingAddress = {
  fullName: '',
  phoneNumber: '',
  countryCode: '+91',
  country: 'India',
  streetAddress: '',
  city: '',
  state: 'Kerala',
  pincode: '',
  shippingTier: 'domestic_standard',
  specialDeliveryNote: '',
};

const CartContext = createContext<CartContextType | undefined>(undefined);

function generateItemKey(productId: string, tailoring: TailoringSelection): string {
  const parts = [
    productId,
    tailoring.type,
    tailoring.sareeFinishing || 'none',
    tailoring.selectedSize || 'none',
    tailoring.additionalCost || 0,
  ];
  return parts.join('__');
}

function isPincodeInKerala(pincode: string): boolean {
  const clean = pincode.trim();
  if (clean.length < 2) return true; // Default to Kerala if empty
  const prefix = clean.substring(0, 2);
  return prefix === '67' || prefix === '68' || prefix === '69';
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CART);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(defaultAddress);

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Clear any legacy saved personal recipient data from localStorage
  useEffect(() => {
    try {
      localStorage.removeItem(STORAGE_KEY_ADDRESS);
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(cartItems));
    } catch {
      // Ignore storage errors
    }
  }, [cartItems]);

  const addToCart = (product: KenzaeProduct, tailoring: TailoringSelection, quantity = 1) => {
    const itemKey = generateItemKey(product.id, tailoring);
    const unitPrice = product.price;
    const additionalCost = tailoring.additionalCost || 0;
    const singleItemTotal = unitPrice + additionalCost;

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === itemKey);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          itemTotal: singleItemTotal * newQty,
        };
        return updated;
      } else {
        const newItem: CartItem = {
          id: itemKey,
          productId: product.id,
          sku: product.sku,
          title: product.title,
          category: product.category,
          subCategory: product.subCategory,
          price: unitPrice,
          image: product.images[0] || '',
          quantity,
          tailoring,
          itemTotal: singleItemTotal * quantity,
        };
        return [newItem, ...prev];
      }
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const unitWithTailoring = item.price + (item.tailoring.additionalCost || 0);
          return {
            ...item,
            quantity: newQty,
            itemTotal: unitWithTailoring * newQty,
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const isItemInCart = (productId: string) => {
    return cartItems.some((item) => item.productId === productId);
  };

  // Compute live totals
  const totals = useMemo<CartTotals>(() => {
    const itemCount = cartItems.reduce((acc, it) => acc + it.quantity, 0);
    const subtotal = cartItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
    const tailoringTotal = cartItems.reduce(
      (acc, it) => acc + (it.tailoring.additionalCost || 0) * it.quantity,
      0
    );

    const isInternational =
      shippingAddress.country !== 'India' ||
      shippingAddress.shippingTier === 'international_express';

    const isKerala =
      !isInternational &&
      (shippingAddress.pincode.trim().length >= 2
        ? isPincodeInKerala(shippingAddress.pincode)
        : shippingAddress.state.trim().toLowerCase() === 'kerala');

    let shippingFee = 0;
    const shippingTier: ShippingTier = isInternational
      ? 'international_express'
      : 'domestic_standard';

    if (itemCount > 0) {
      if (isInternational) {
        shippingFee = INTERNATIONAL_EXPRESS_SHIPPING_INR;
      } else if (isKerala) {
        shippingFee = subtotal >= KERALA_FREE_SHIPPING_THRESHOLD ? 0 : KERALA_STANDARD_SHIPPING;
      } else {
        shippingFee = INTERSTATE_SHIPPING;
      }
    }

    const grandTotal = subtotal + tailoringTotal + shippingFee;
    const amountNeededForFreeShipping =
      !isInternational && isKerala
        ? Math.max(0, KERALA_FREE_SHIPPING_THRESHOLD - subtotal)
        : 0;

    return {
      itemCount,
      subtotal,
      tailoringTotal,
      shippingFee,
      shippingTier,
      grandTotal,
      isKeralaDelivery: isKerala,
      isInternationalDelivery: isInternational,
      freeShippingThreshold: KERALA_FREE_SHIPPING_THRESHOLD,
      amountNeededForFreeShipping,
    };
  }, [cartItems, shippingAddress]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        shippingAddress,
        setShippingAddress,
        totals,
        isItemInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
