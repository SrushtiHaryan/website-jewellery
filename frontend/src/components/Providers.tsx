'use client';

import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';

/**
 * Client providers: toast host + session hydration. When a token is present we
 * refresh the user and load the cart/wishlist so counts are correct on load.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthStore((s) => s.hydrated);

  // Safety net: ensure hydration is marked complete once mounted on the client.
  useEffect(() => {
    if (!useAuthStore.getState().hydrated) {
      useAuthStore.getState().setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (token) {
      useAuthStore.getState().refreshUser();
      useCartStore.getState().fetch().catch(() => undefined);
      useWishlistStore.getState().fetch().catch(() => undefined);
    } else {
      useCartStore.getState().reset();
      useWishlistStore.getState().reset();
    }
  }, [token, hydrated]);

  return (
    <>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#FBF9F4',
            border: '1px solid #E7D8BE',
            color: '#3A2E23',
          },
        }}
      />
    </>
  );
}
