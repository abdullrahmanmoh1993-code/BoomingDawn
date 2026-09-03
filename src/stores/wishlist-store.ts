"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistStore {
  productIds: string[];
  toggleItem: (productId: string) => void;
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      productIds: [],

      toggleItem: (productId) => {
        if (get().isInWishlist(productId)) {
          get().removeItem(productId);
        } else {
          get().addItem(productId);
        }
      },

      addItem: (productId) => {
        set((state) => ({
          productIds: state.productIds.includes(productId)
            ? state.productIds
            : [...state.productIds, productId],
        }));
      },

      removeItem: (productId) => {
        set((state) => ({
          productIds: state.productIds.filter((id) => id !== productId),
        }));
      },

      isInWishlist: (productId) => get().productIds.includes(productId),
    }),
    { name: "tbd-wishlist" }
  )
);
