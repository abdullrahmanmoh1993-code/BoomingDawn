"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Order } from "@/lib/types";

interface OrderStore {
  orders: Order[];
  /** Prefer loading a specific completed order on the confirmation screen. */
  lastOrder: Order | null;
  addOrder: (order: Order) => void;
  updatePaymentStatus: (
    orderNumber: string,
    status: Order["paymentStatus"]
  ) => void;
}

/**
 * Local persistence for placed orders (integration point until a real
 * backend/database is connected). The order create API also returns the
 * server-computed order; this store keeps a copy for confirmation display.
 */
export const useOrderStore = create<OrderStore>()(
  persist(
    (set) => ({
      orders: [],
      lastOrder: null,
      addOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders],
          lastOrder: order,
        })),
      updatePaymentStatus: (orderNumber, status) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.orderNumber === orderNumber ? { ...o, paymentStatus: status } : o
          ),
          lastOrder:
            state.lastOrder?.orderNumber === orderNumber
              ? { ...state.lastOrder, paymentStatus: status }
              : state.lastOrder,
        })),
    }),
    { name: "tbd-orders" }
  )
);