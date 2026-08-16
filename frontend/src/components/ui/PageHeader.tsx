import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href: string }[];
}) {
  return (
    <div className="border-b border-champagne/60 bg-cream">
      <div className="container-luxe py-12 md:py-16">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-clay" aria-label="Breadcrumb">
            {breadcrumbs.map((b, i) => (
              <span key={b.href} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="h-3 w-3" />}
                {i === breadcrumbs.length - 1 ? (
                  <span className="text-cocoa">{b.label}</span>
                ) : (
                  <Link href={b.href} className="transition hover:text-gold">
                    {b.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>
        )}
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-2 font-serif text-4xl text-cocoa md:text-5xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl leading-relaxed text-clay">{description}</p>}
      </div>
    </div>
  );
}
