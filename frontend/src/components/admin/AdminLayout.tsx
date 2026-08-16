'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  FolderTree,
  Layers,
  Star,
  FileText,
  Store,
  LogOut,
} from 'lucide-react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { useAuthStore } from '@/store/auth';
import { SITE_NAME } from '@/lib/config';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/inventory', label: 'Inventory', icon: Boxes },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/collections', label: 'Collections', icon: Layers },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/blog', label: 'Journal', icon: FileText },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);

  return (
    <RequireAuth role="admin">
      <div className="min-h-screen bg-ivory lg:grid lg:grid-cols-[248px_1fr]">
        {/* Sidebar */}
        <aside className="hidden border-r border-champagne/60 bg-cream/50 lg:flex lg:flex-col">
          <div className="border-b border-champagne/60 p-6">
            <span className="font-serif text-xl tracking-[0.2em] text-cocoa">
              {SITE_NAME.toUpperCase()}
            </span>
            <p className="mt-0.5 text-[10px] uppercase tracking-luxe text-gold">Admin</p>
          </div>
          <nav className="flex flex-1 flex-col gap-1 p-4">
            {NAV.map((item) => {
              const active =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href);
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
          </nav>
          <div className="border-t border-champagne/60 p-4">
            <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-cocoa hover:bg-cream">
              <Store className="h-4 w-4" />
              View storefront
            </Link>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-cocoa hover:bg-cream"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </aside>

        {/* Mobile top nav */}
        <div className="border-b border-champagne/60 bg-cream/50 p-4 lg:hidden">
          <div className="flex items-center justify-between">
            <span className="font-serif text-lg tracking-[0.2em] text-cocoa">
              {SITE_NAME.toUpperCase()} · Admin
            </span>
            <button onClick={logout} className="btn-ghost" aria-label="Sign out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'whitespace-nowrap rounded-full px-3 py-1.5 text-xs',
                  pathname === item.href ? 'bg-cocoa text-ivory' : 'bg-cream text-cocoa'
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Content */}
        <main className="p-5 md:p-8">{children}</main>
      </div>
    </RequireAuth>
  );
}
