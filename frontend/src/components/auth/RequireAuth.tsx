'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

/**
 * Client-side guard for authenticated pages. Waits for store hydration to
 * avoid a flash, then redirects to /login (preserving the return path) if
 * there is no user, or to home if a role is required and not met.
 */
export function RequireAuth({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: 'admin' | 'customer';
}) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    } else if (role && user.role !== role) {
      router.replace('/');
    }
  }, [hydrated, user, role, router, pathname]);

  if (!hydrated || !user || (role && user.role !== role)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  return <>{children}</>;
}
