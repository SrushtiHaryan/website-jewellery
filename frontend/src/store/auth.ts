'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { API_URL } from '@/lib/config';
import type { ApiEnvelope, User } from '@/lib/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  hydrated: boolean;

  setSession: (tokens: { accessToken: string; refreshToken: string }) => void;
  setUser: (user: User | null) => void;
  setHydrated: (v: boolean) => void;
  login: (email: string, password: string) => Promise<User>;
  register: (input: { name: string; email: string; password: string; phone?: string }) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clear: () => void;
}

async function post<T>(path: string, body: unknown): Promise<ApiEnvelope<T>> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!res.ok || !json?.success) {
    throw new Error(json?.message ?? 'Request failed');
  }
  return json;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      hydrated: false,

      setSession: ({ accessToken, refreshToken }) => set({ accessToken, refreshToken }),
      setUser: (user) => set({ user }),
      setHydrated: (v) => set({ hydrated: v }),

      login: async (email, password) => {
        const json = await post<{ user: User; accessToken: string; refreshToken: string }>(
          '/auth/login',
          { email, password }
        );
        set({
          user: json.data.user,
          accessToken: json.data.accessToken,
          refreshToken: json.data.refreshToken,
        });
        return json.data.user;
      },

      register: async (input) => {
        const json = await post<{ user: User; accessToken: string; refreshToken: string }>(
          '/auth/register',
          input
        );
        set({
          user: json.data.user,
          accessToken: json.data.accessToken,
          refreshToken: json.data.refreshToken,
        });
        return json.data.user;
      },

      logout: async () => {
        try {
          await post('/auth/logout', {});
        } catch {
          /* ignore */
        }
        set({ user: null, accessToken: null, refreshToken: null });
      },

      refreshUser: async () => {
        const token = get().accessToken;
        if (!token) return;
        try {
          const res = await fetch(`${API_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
            credentials: 'include',
          });
          if (res.ok) {
            const json = (await res.json()) as ApiEnvelope<User>;
            set({ user: json.data });
          }
        } catch {
          /* ignore */
        }
      },

      clear: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    {
      name: 'aurelia-auth',
      partialize: (s) => ({
        user: s.user,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
      }),
      // Use the `set` captured in the store closure (not the store ref, which is
      // still in its temporal dead zone when synchronous rehydration fires).
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
