'use client';

import { create } from 'zustand';
import { apiFetch } from '@/lib/api-client';
import type { CartView } from '@/lib/types';

interface CartState {
  cart: CartView | null;
  loading: boolean;
  fetch: () => Promise<void>;
  add: (productId: string, quantity?: number, size?: string) => Promise<void>;
  update: (itemId: string, quantity: number) => Promise<void>;
  remove: (itemId: string) => Promise<void>;
  clear: () => Promise<void>;
  reset: () => void;
  count: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  loading: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const cart = await apiFetch<CartView>('/cart');
      set({ cart });
    } finally {
      set({ loading: false });
    }
  },

  add: async (productId, quantity = 1, size) => {
    const cart = await apiFetch<CartView>('/cart/items', {
      method: 'POST',
      body: { productId, quantity, size },
    });
    set({ cart });
  },

  update: async (itemId, quantity) => {
    const cart = await apiFetch<CartView>(`/cart/items/${itemId}`, {
      method: 'PATCH',
      body: { quantity },
    });
    set({ cart });
  },

  remove: async (itemId) => {
    const cart = await apiFetch<CartView>(`/cart/items/${itemId}`, { method: 'DELETE' });
    set({ cart });
  },

  clear: async () => {
    const cart = await apiFetch<CartView>('/cart', { method: 'DELETE' });
    set({ cart });
  },

  reset: () => set({ cart: null }),

  count: () => {
    const cart = get().cart;
    if (!cart) return 0;
    return cart.items.reduce((sum, i) => sum + i.quantity, 0);
  },
}));
