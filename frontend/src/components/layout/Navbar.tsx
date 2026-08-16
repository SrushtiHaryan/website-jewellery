'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Heart,
  ShoppingBag,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { API_URL, SITE_NAME } from '@/lib/config';
import type { ApiEnvelope, Category, Collection } from '@/lib/types';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Shop', href: '/shop' },
  { label: 'New Arrivals', href: '/shop?newArrival=true' },
  { label: 'About', href: '/about' },
  { label: 'Journal', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

export function Navbar() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const cartCount = useCartStore((s) => (s.cart ? s.cart.items.reduce((a, i) => a + i.quantity, 0) : 0));
  const wishlistCount = useWishlistStore((s) => s.products.length);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/categories`)
      .then((r) => r.json())
      .then((j: ApiEnvelope<Category[]>) => setCategories(j.data?.filter((c) => !c.parent) ?? []))
      .catch(() => undefined);
    fetch(`${API_URL}/collections`)
      .then((r) => r.json())
      .then((j: ApiEnvelope<Collection[]>) => setCollections(j.data ?? []))
      .catch(() => undefined);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchOpen(false);
    setMobileOpen(false);
    router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled ? 'bg-ivory/95 shadow-soft backdrop-blur' : 'bg-ivory'
      )}
    >
      {/* Announcement bar */}
      <div className="bg-cocoa text-center text-[11px] uppercase tracking-luxe text-ivory/90">
        <div className="container-luxe py-2">
          Complimentary shipping on orders over ₹2,000 · Certified craftsmanship
        </div>
      </div>

      <nav className="container-luxe">
        <div className="flex h-16 items-center justify-between gap-4 md:h-20">
          {/* Left: mobile menu + desktop nav */}
          <div className="flex flex-1 items-center gap-6">
            <button
              className="icon-btn h-10 w-10 -ml-1 md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="hidden items-center gap-6 md:flex">
              <NavDropdown label="Categories">
                <div className="grid w-[420px] grid-cols-2 gap-1 p-2">
                  {categories.map((c) => (
                    <Link
                      key={c._id}
                      href={`/jewellery/${c.slug}`}
                      className="rounded-lg px-3 py-2 text-sm text-cocoa transition hover:bg-cream"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </NavDropdown>
              <NavDropdown label="Collections">
                <div className="grid w-[320px] gap-1 p-2">
                  {collections.map((c) => (
                    <Link
                      key={c._id}
                      href={`/collections/${c.slug}`}
                      className="rounded-lg px-3 py-2 text-sm text-cocoa transition hover:bg-cream"
                    >
                      <span className="block font-medium">{c.name}</span>
                      {c.tagline && (
                        <span className="text-xs text-clay">{c.tagline}</span>
                      )}
                    </Link>
                  ))}
                </div>
              </NavDropdown>
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="link-underline text-sm font-medium text-cocoa"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Center: logo */}
          <Link href="/" className="flex flex-col items-center leading-none">
            <span className="font-serif text-2xl font-semibold tracking-[0.2em] text-cocoa md:text-3xl">
              {SITE_NAME.toUpperCase()}
            </span>
            <span className="mt-0.5 text-[9px] uppercase tracking-luxe text-gold">
              Fine Jewellery
            </span>
          </Link>

          {/* Right: actions */}
          <div className="flex flex-1 items-center justify-end gap-0.5 sm:gap-1">
            <button
              className="icon-btn h-10 w-10"
              onClick={() => setSearchOpen((s) => !s)}
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            <Link href="/account/wishlist" className="icon-btn relative h-10 w-10" aria-label="Wishlist">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && <Badge>{wishlistCount}</Badge>}
            </Link>

            <Link href="/cart" className="icon-btn relative h-10 w-10" aria-label="Cart">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && <Badge>{cartCount}</Badge>}
            </Link>

            <AccountMenu userName={user?.name} isAdmin={user?.role === 'admin'} onLogout={logout} />
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <form onSubmit={submitSearch} className="animate-fade-in pb-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-clay" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for Kundan necklaces, jhumkas, rings…"
                className="input pl-11"
              />
            </div>
          </form>
        )}
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <MobileDrawer
          categories={categories}
          collections={collections}
          onClose={() => setMobileOpen(false)}
          onSearch={submitSearch}
          query={query}
          setQuery={setQuery}
          user={user?.name}
          isAdmin={user?.role === 'admin'}
        />
      )}
    </header>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold leading-none text-ivory">
      {children}
    </span>
  );
}

function NavDropdown({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="group relative">
      <button className="flex items-center gap-1 text-sm font-medium text-cocoa">
        {label}
        <ChevronDown className="h-3.5 w-3.5 transition group-hover:rotate-180" />
      </button>
      <div className="invisible absolute left-0 top-full z-50 translate-y-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        <div className="mt-2 overflow-hidden rounded-2xl border border-champagne/60 bg-white shadow-soft">
          {children}
        </div>
      </div>
    </div>
  );
}

function AccountMenu({
  userName,
  isAdmin,
  onLogout,
}: {
  userName?: string;
  isAdmin?: boolean;
  onLogout: () => void;
}) {
  return (
    <div className="group relative">
      <Link href={userName ? '/account' : '/login'} className="icon-btn h-10 w-10" aria-label="Account">
        <UserIcon className="h-5 w-5" />
      </Link>
      <div className="invisible absolute right-0 top-full z-50 translate-y-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        <div className="mt-2 w-48 overflow-hidden rounded-2xl border border-champagne/60 bg-white p-1.5 shadow-soft">
          {userName ? (
            <>
              <div className="px-3 py-2 text-xs text-clay">Hello, {userName.split(' ')[0]}</div>
              <MenuLink href="/account">My Account</MenuLink>
              <MenuLink href="/account/orders">My Orders</MenuLink>
              <MenuLink href="/account/wishlist">Wishlist</MenuLink>
              {isAdmin && <MenuLink href="/admin">Admin Dashboard</MenuLink>}
              <button
                onClick={onLogout}
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-cocoa transition hover:bg-cream"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <MenuLink href="/login">Sign in</MenuLink>
              <MenuLink href="/register">Create account</MenuLink>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MenuLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="block rounded-lg px-3 py-2 text-sm text-cocoa transition hover:bg-cream">
      {children}
    </Link>
  );
}

function MobileDrawer({
  categories,
  collections,
  onClose,
  onSearch,
  query,
  setQuery,
  user,
  isAdmin,
}: {
  categories: Category[];
  collections: Collection[];
  onClose: () => void;
  onSearch: (e: React.FormEvent) => void;
  query: string;
  setQuery: (v: string) => void;
  user?: string;
  isAdmin?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[60] md:hidden">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="absolute left-0 top-0 h-full w-[85%] max-w-sm overflow-y-auto bg-ivory p-6 shadow-soft">
        <div className="mb-6 flex items-center justify-between">
          <span className="font-serif text-xl tracking-[0.2em] text-cocoa">{SITE_NAME.toUpperCase()}</span>
          <button onClick={onClose} aria-label="Close menu" className="btn-ghost">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSearch} className="mb-6">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search jewellery…"
            className="input"
          />
        </form>

        <nav className="flex flex-col gap-1">
          <DrawerLink href="/shop" onClose={onClose}>Shop All</DrawerLink>
          <DrawerLink href="/shop?newArrival=true" onClose={onClose}>New Arrivals</DrawerLink>
          <p className="mt-4 eyebrow">Categories</p>
          {categories.map((c) => (
            <DrawerLink key={c._id} href={`/jewellery/${c.slug}`} onClose={onClose}>
              {c.name}
            </DrawerLink>
          ))}
          <p className="mt-4 eyebrow">Collections</p>
          {collections.map((c) => (
            <DrawerLink key={c._id} href={`/collections/${c.slug}`} onClose={onClose}>
              {c.name}
            </DrawerLink>
          ))}
          <p className="mt-4 eyebrow">More</p>
          <DrawerLink href="/about" onClose={onClose}>About</DrawerLink>
          <DrawerLink href="/blog" onClose={onClose}>Journal</DrawerLink>
          <DrawerLink href="/contact" onClose={onClose}>Contact</DrawerLink>
          <DrawerLink href={user ? '/account' : '/login'} onClose={onClose}>
            {user ? 'My Account' : 'Sign in'}
          </DrawerLink>
          {isAdmin && <DrawerLink href="/admin" onClose={onClose}>Admin Dashboard</DrawerLink>}
        </nav>
      </div>
    </div>
  );
}

function DrawerLink({
  href,
  children,
  onClose,
}: {
  href: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className="rounded-lg px-3 py-2.5 text-sm font-medium text-cocoa transition hover:bg-cream"
    >
      {children}
    </Link>
  );
}
