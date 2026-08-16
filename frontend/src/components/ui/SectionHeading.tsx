import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkLabel = 'View all',
  align = 'left',
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  align?: 'left' | 'center';
}) {
  return (
    <div
      className={
        align === 'center'
          ? 'flex flex-col items-center text-center'
          : 'flex flex-wrap items-end justify-between gap-4'
      }
    >
      <div className={align === 'center' ? 'max-w-2xl' : ''}>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="mt-2 font-serif text-3xl text-cocoa md:text-4xl">{title}</h2>
        {description && (
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-clay">{description}</p>
        )}
      </div>
      {href && (
        <Link href={href} className="link-underline inline-flex items-center gap-1.5 text-sm font-medium text-gold">
          {linkLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
