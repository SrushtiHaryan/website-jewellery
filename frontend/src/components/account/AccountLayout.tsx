'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Package, MapPin, Heart, LogOut, LayoutDashboard } from 'lucide-react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/account', label: 'Profile', icon: User },
  { href: '/account/orders', label: 'Orders', icon: Package },
  { href: '/account/addresses', label: 'Addresses', icon: MapPin },
  { href: '/account/wishlist', label: 'Wishlist', icon: Heart },
];

export function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <RequireAuth>
      <div className="container-luxe py-12">
        <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
          <aside>
            <div className="card p-5">
              <p className="font-serif text-xl text-cocoa">{user?.name}</p>
              <p className="text-xs text-clay">{user?.email}</p>
            </div>
            <nav className="mt-4 flex flex-col gap-1">
              {NAV.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition',
                      active ? 'bg-cocoa text-ivory' : 'text-cocoa hover:bg-cream'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
              {user?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gold transition hover:bg-cream"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={logout}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-cocoa transition hover:bg-cream"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </nav>
          </aside>

          <div>{children}</div>
        </div>
      </div>
    </RequireAuth>
  );
}
