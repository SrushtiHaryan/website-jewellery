'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

/**
 * The storefront navbar/footer are hidden on the admin interface, which brings
 * its own full-screen chrome.
 */
function useIsAdmin() {
  const pathname = usePathname();
  return pathname?.startsWith('/admin') ?? false;
}

export function SiteHeader() {
  return useIsAdmin() ? null : <Navbar />;
}

export function SiteFooter() {
  return useIsAdmin() ? null : <Footer />;
}
