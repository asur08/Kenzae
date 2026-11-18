import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  BoutiqueOrder,
  CourierPartner,
  FulfillmentStatus,
  PaymentMethod,
  PaymentStatus,
  TaxBreakdown,
} from '../types/orders';
import { CartItem, ShippingAddress } from '../types/cart';
import { generateTrackingUrl } from '../utils/courierTracking';

interface OrdersContextType {
  orders: BoutiqueOrder[];
  createOrder: (
    customer: ShippingAddress,
    items: CartItem[],
    paymentMethod?: PaymentMethod,
    paymentStatus?: PaymentStatus,
    razorpayPaymentId?: string
  ) => BoutiqueOrder;
  updateOrderStatus: (orderId: string, status: FulfillmentStatus) => void;
  updatePaymentStatus: (orderId: string, status: PaymentStatus) => void;
  dispatchOrder: (
    orderId: string,
    courierPartner: CourierPartner,
    trackingAwb: string
  ) => BoutiqueOrder | null;
  deleteOrder: (orderId: string) => void;
  getOrderById: (orderId: string) => BoutiqueOrder | undefined;
  resetToSampleOrders: () => void;
}

const STORAGE_KEY_ORDERS = 'kenzae_boutique_orders_v1';

function computeTaxBreakdown(subtotal: number, isKerala: boolean): TaxBreakdown {
  const gstRate = 0.05; // 5% standard GST slab for handloom & ethnic apparel
  const taxableAmount = Math.round((subtotal / (1 + gstRate)) * 100) / 100;
  const totalTax = Math.round((subtotal - taxableAmount) * 100) / 100;

  if (isKerala) {
    const halfTax = Math.round((totalTax / 2) * 100) / 100;
    return {
      taxableAmount,
      isKeralaIntrastate: true,
      cgstRate: 2.5,
      cgstAmount: halfTax,
      sgstRate: 2.5,
      sgstAmount: halfTax,
      igstRate: 0,
      igstAmount: 0,
      totalTax,
    };
  } else {
    return {
      taxableAmount,
      isKeralaIntrastate: false,
      cgstRate: 0,
      cgstAmount: 0,
      sgstRate: 0,
      sgstAmount: 0,
      igstRate: 5.0,
      igstAmount: totalTax,
      totalTax,
    };
  }
}

function isPincodeKerala(pincode: string): boolean {
  const clean = pincode.trim();
  if (clean.length < 2) return true;
  const prefix = clean.substring(0, 2);
  return prefix === '67' || prefix === '68' || prefix === '69';
}

const SAMPLE_ORDERS: BoutiqueOrder[] = [
  {
    id: 'ord-sample-001',
    orderNumber: 'KZ-2026-1041',
    invoiceNumber: 'KZ-INV-2026-1041',
    customer: {
      fullName: 'Dr. Ananya Varma',
      phoneNumber: '9447012345',
      streetAddress: 'Palace Road, Near Kripa Bhavan',
      city: 'Tripunithura, Ernakulam',
      state: 'Kerala',
      pincode: '682301',
      specialDeliveryNote: 'Please ensure fall & pico is finished neatly with maroon thread.',
    },
    items: [
      {
        id: 'kz-sr-001__saree_fall_and_pico',
        productId: 'kz-sr-001',
        sku: 'KZ-SR-001',
        title: 'Handwoven Banarasi Katan Silk Sari in Wine Plum & Antique Gold',
        category: 'Saris',
        subCategory: 'Banarasi Katan Silk',
        price: 12850,
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
        quantity: 1,
        tailoring: {
          type: 'saree',
          sareeFinishing: 'fall_and_pico',
          additionalCost: 250,
        },
        itemTotal: 13100,
      },
    ],
    subtotal: 12850,
    tailoringTotal: 250,
    shippingFee: 0,
    grandTotal: 13100,
    taxBreakdown: computeTaxBreakdown(13100, true),
    paymentMethod: 'whatsapp_upi',
    paymentStatus: 'paid',
    fulfillmentStatus: 'tailoring',
    staffNotes: 'Fall and pico in progress at Mulanthuruthy atelier. Master draper informed.',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'ord-sample-002',
    orderNumber: 'KZ-2026-1040',
    invoiceNumber: 'KZ-INV-2026-1040',
    customer: {
      fullName: 'Meera Nambiar',
      phoneNumber: '9895054321',
      streetAddress: 'Flat 4B, Skyline Citylights, Jawahar Nagar',
      city: 'Kadavanthra, Kochi',
      state: 'Kerala',
      pincode: '682020',
      specialDeliveryNote: 'Leave with apartment security if not home.',
    },
    items: [
      {
        id: 'kz-sr-002__saree_unstitched',
        productId: 'kz-sr-002',
        sku: 'KZ-SR-002',
        title: 'Kerala Kasavu Organza Sari with Fine Temple Zari Border',
        category: 'Saris',
        subCategory: 'Kerala Kasavu / Organza',
        price: 6450,
        image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
        quantity: 1,
        tailoring: {
          type: 'saree',
          sareeFinishing: 'unstitched',
          additionalCost: 0,
        },
        itemTotal: 6450,
      },
    ],
    subtotal: 6450,
    tailoringTotal: 0,
    shippingFee: 0,
    grandTotal: 6450,
    taxBreakdown: computeTaxBreakdown(6450, true),
    paymentMethod: 'whatsapp_upi',
    paymentStatus: 'paid',
    fulfillmentStatus: 'shipped',
    courierPartner: 'DTDC',
    trackingAwb: 'D847291039IN',
    trackingUrl: 'https://www.dtdc.in/tracking/shipment-tracking.asp?tracking_no=D847291039IN',
    createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    dispatchedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 'ord-sample-003',
    orderNumber: 'KZ-2026-1039',
    invoiceNumber: 'KZ-INV-2026-1039',
    customer: {
      fullName: 'Sreedevi Pillai',
      phoneNumber: '9746112233',
      streetAddress: 'Villa 12, Sobha Silverwoods',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560037',
    },
    items: [
      {
        id: 'kz-sr-003__saree_fall_and_pico',
        productId: 'kz-sr-003',
        sku: 'KZ-SR-003',
        title: 'Raw Ghicha Tussar Silk Sari with Natural Dye Floral Pallu',
        category: 'Saris',
        subCategory: 'Tussar Silk',
        price: 8900,
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
        quantity: 1,
        tailoring: {
          type: 'saree',
          sareeFinishing: 'fall_and_pico',
          additionalCost: 250,
        },
        itemTotal: 9150,
      },
    ],
    subtotal: 8900,
    tailoringTotal: 250,
    shippingFee: 200, // Interstate shipping
    grandTotal: 9350,
    taxBreakdown: computeTaxBreakdown(9350, false),
    paymentMethod: 'whatsapp_upi',
    paymentStatus: 'paid',
    fulfillmentStatus: 'delivered',
    courierPartner: 'Speed Post (India Post)',
    trackingAwb: 'EK837192841IN',
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    dispatchedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const OrdersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<BoutiqueOrder[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ORDERS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback to sample
    }
    return SAMPLE_ORDERS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
    } catch {
      // Ignore
    }
  }, [orders]);

  const createOrder = (
    customer: ShippingAddress,
    items: CartItem[],
    paymentMethod: PaymentMethod = 'whatsapp_upi',
    paymentStatus: PaymentStatus = 'pending',
    razorpayPaymentId?: string
  ): BoutiqueOrder => {
    const timestamp = Date.now();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `KZ-2026-${randomSuffix}`;
    const invoiceNumber = `KZ-INV-2026-${randomSuffix}`;

    const subtotal = items.reduce((acc, it) => acc + it.price * it.quantity, 0);
    const tailoringTotal = items.reduce(
      (acc, it) => acc + (it.tailoring.additionalCost || 0) * it.quantity,
      0
    );

    const isKerala = customer.pincode
      ? isPincodeKerala(customer.pincode)
      : customer.state.trim().toLowerCase() === 'kerala';

    const shippingFee = isKerala ? (subtotal >= 2500 ? 0 : 100) : 200;
    const grandTotal = subtotal + tailoringTotal + shippingFee;

    const newOrder: BoutiqueOrder = {
      id: `ord-${timestamp}`,
      orderNumber,
      invoiceNumber,
      customer,
      items,
      subtotal,
      tailoringTotal,
      shippingFee,
      grandTotal,
      taxBreakdown: computeTaxBreakdown(grandTotal, isKerala),
      paymentMethod,
      paymentStatus,
      fulfillmentStatus: 'new',
      razorpayPaymentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: FulfillmentStatus) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? { ...ord, fulfillmentStatus: status, updatedAt: new Date().toISOString() }
          : ord
      )
    );
  };

  const updatePaymentStatus = (orderId: string, status: PaymentStatus) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? { ...ord, paymentStatus: status, updatedAt: new Date().toISOString() }
          : ord
      )
    );
  };

  const dispatchOrder = (
    orderId: string,
    courierPartner: CourierPartner,
    trackingAwb: string
  ): BoutiqueOrder | null => {
    let updatedOrder: BoutiqueOrder | null = null;

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const trackingUrl = generateTrackingUrl(courierPartner, trackingAwb);
          updatedOrder = {
            ...ord,
            fulfillmentStatus: 'shipped',
            courierPartner,
            trackingAwb: trackingAwb.trim(),
            trackingUrl,
            dispatchedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return updatedOrder;
        }
        return ord;
      })
    );

    return updatedOrder;
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((ord) => ord.id !== orderId));
  };

  const getOrderById = (orderId: string) => {
    return orders.find((ord) => ord.id === orderId);
  };

  const resetToSampleOrders = () => {
    setOrders(SAMPLE_ORDERS);
  };

  return (
    <OrdersContext.Provider
      value={{
        orders,
        createOrder,
        updateOrderStatus,
        updatePaymentStatus,
        dispatchOrder,
        deleteOrder,
        getOrderById,
        resetToSampleOrders,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
};
