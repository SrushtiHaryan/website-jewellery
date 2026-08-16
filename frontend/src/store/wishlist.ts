'use client';

import { create } from 'zustand';
import { apiFetch } from '@/lib/api-client';
import type { Product } from '@/lib/types';

interface WishlistDoc {
  products: Product[];
}

interface WishlistState {
  ids: Set<string>;
  products: Product[];
  loading: boolean;
  fetch: () => Promise<void>;
  toggle: (productId: string) => Promise<boolean>;
  remove: (productId: string) => Promise<void>;
  moveToCart: (productId: string) => Promise<void>;
  reset: () => void;
  has: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  ids: new Set(),
  products: [],
  loading: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const list = await apiFetch<WishlistDoc>('/wishlist');
      set({
        products: list.products ?? [],
        ids: new Set((list.products ?? []).map((p) => p._id)),
      });
    } finally {
      set({ loading: false });
    }
  },

  toggle: async (productId) => {
    const has = get().ids.has(productId);
    if (has) {
      await get().remove(productId);
      return false;
    }
    const list = await apiFetch<WishlistDoc>('/wishlist', {
      method: 'POST',
      body: { productId },
    });
    set({ products: list.products, ids: new Set(list.products.map((p) => p._id)) });
    return true;
  },

  remove: async (productId) => {
    const list = await apiFetch<WishlistDoc>(`/wishlist/${productId}`, { method: 'DELETE' });
    set({ products: list.products, ids: new Set(list.products.map((p) => p._id)) });
  },

  moveToCart: async (productId) => {
    const list = await apiFetch<WishlistDoc>(`/wishlist/${productId}/move-to-cart`, {
      method: 'POST',
    });
    set({ products: list.products, ids: new Set(list.products.map((p) => p._id)) });
  },

  reset: () => set({ ids: new Set(), products: [] }),

  has: (productId) => get().ids.has(productId),
}));
