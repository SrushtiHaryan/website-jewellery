import Link from 'next/link';
import { Instagram, Facebook } from 'lucide-react';
import { SITE_NAME } from '@/lib/config';
import { NewsletterForm } from './NewsletterForm';

const COLUMNS = [
  {
    title: 'Shop',
    links: [
      { label: 'All Jewellery', href: '/shop' },
      { label: 'New Arrivals', href: '/shop?newArrival=true' },
      { label: 'Necklaces', href: '/jewellery/necklaces' },
      { label: 'Earrings', href: '/jewellery/earrings' },
      { label: 'Rings', href: '/jewellery/rings' },
      { label: 'Bangles', href: '/jewellery/bangles' },
    ],
  },
  {
    title: 'Collections',
    links: [
      { label: 'Bridal', href: '/collections/bridal-collection' },
      { label: 'Festive', href: '/collections/festive-collection' },
      { label: 'Everyday Elegance', href: '/collections/everyday-elegance' },
      { label: 'Royal', href: '/collections/royal-collection' },
      { label: 'Minimal', href: '/collections/minimal-collection' },
    ],
  },
  {
    title: 'Customer Care',
    links: [
      { label: 'Contact Us', href: '/contact' },
      { label: 'Shipping', href: '/shipping' },
      { label: 'Returns & Refunds', href: '/returns' },
      { label: 'Track Order', href: '/account/orders' },
      { label: 'FAQs', href: '/faq' },
    ],
  },
  {
    title: 'About',
    links: [
      { label: 'Our Story', href: '/about' },
      { label: 'Journal', href: '/blog' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-champagne/60 bg-cream">
      {/* Newsletter */}
      <div className="border-b border-champagne/60">
        <div className="container-luxe grid gap-8 py-14 md:grid-cols-2 md:items-center">
          <div>
            <p className="eyebrow">Join the Aurelia circle</p>
            <h3 className="mt-2 font-serif text-3xl text-cocoa">
              Be first to see new arrivals & private events
            </h3>
          </div>
          <NewsletterForm />
        </div>
      </div>

      {/* Link columns */}
      <div className="container-luxe grid grid-cols-2 gap-8 py-14 md:grid-cols-5">
        <div className="col-span-2 md:col-span-1">
          <span className="font-serif text-2xl tracking-[0.2em] text-cocoa">
            {SITE_NAME.toUpperCase()}
          </span>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-clay">
            Premium Indian jewellery, blending heritage craftsmanship with modern design —
            crafted to be treasured for generations.
          </p>
          <div className="mt-5 flex gap-3">
            <a href="https://instagram.com" aria-label="Instagram" className="btn-ghost rounded-full border border-champagne">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="https://facebook.com" aria-label="Facebook" className="btn-ghost rounded-full border border-champagne">
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-cocoa">
              {col.title}
            </h4>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-clay transition hover:text-gold">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-champagne/60">
        <div className="container-luxe flex flex-col items-center justify-between gap-2 py-6 text-xs text-clay md:flex-row">
          <p>© {new Date().getFullYear()} {SITE_NAME} Fine Jewellery. All rights reserved.</p>
          <p>Handcrafted in India · BIS Hallmarked</p>
        </div>
      </div>
    </footer>
  );
}
