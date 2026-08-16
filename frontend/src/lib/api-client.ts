'use client';

import { API_URL } from './config';
import type { ApiEnvelope } from './types';
import { useAuthStore } from '@/store/auth';

export class ApiError extends Error {
  status: number;
  errors?: { path: string; message: string }[];
  constructor(status: number, message: string, errors?: { path: string; message: string }[]) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  /** Skip attaching the auth token (for public/auth endpoints). */
  auth?: boolean;
  /** Internal: prevents infinite refresh loops. */
  _retry?: boolean;
}

async function refreshTokens(): Promise<boolean> {
  const { refreshToken, setSession, clear } = useAuthStore.getState();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) throw new Error('refresh failed');
    const json = (await res.json()) as ApiEnvelope<{ accessToken: string; refreshToken: string }>;
    setSession({ accessToken: json.data.accessToken, refreshToken: json.data.refreshToken });
    return true;
  } catch {
    clear();
    return false;
  }
}

/**
 * Authenticated (and public) client fetch. Attaches the Bearer token, and on a
 * 401 transparently refreshes once before retrying.
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true, _retry = false } = options;
  const token = useAuthStore.getState().accessToken;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && auth && !_retry) {
    const ok = await refreshTokens();
    if (ok) return apiFetch<T>(path, { ...options, _retry: true });
  }

  const json = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!res.ok || !json?.success) {
    throw new ApiError(
      res.status,
      json?.message ?? 'Something went wrong.',
      json?.errors
    );
  }
  return json.data;
}

export function apiMessage(path: string, options: RequestOptions = {}) {
  return apiFetch<unknown>(path, options);
}

/**
 * Upload one or more image files to the admin upload endpoint (multipart).
 * Returns the Cloudinary URLs + public ids.
 */
export async function uploadImages(
  files: File[]
): Promise<{ url: string; publicId: string }[]> {
  const token = useAuthStore.getState().accessToken;
  const fd = new FormData();
  files.forEach((f) => fd.append('images', f));

  const res = await fetch(`${API_URL}/admin/uploads`, {
    method: 'POST',
    // Do NOT set Content-Type — the browser sets the multipart boundary.
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: 'include',
    body: fd,
  });
  const json = (await res.json().catch(() => null)) as ApiEnvelope<
    { url: string; publicId: string }[]
  > | null;
  if (!res.ok || !json?.success) {
    throw new ApiError(res.status, json?.message ?? 'Upload failed.');
  }
  return json.data;
}
