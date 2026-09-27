import Image from 'next/image';
import Link from 'next/link';
import type { Category } from '@/lib/types';
import { SectionHeading } from '@/components/ui/SectionHeading';

const categoryImages: Record<string, string> = {
  necklaces: '/images/aurelia-craft.jpg',
  earrings: '/images/aurelia-earrings.jpg',
  rings: '/images/aurelia-rings.jpg',
  bangles: '/images/aurelia-bangles.jpg',
  bracelets: '/images/aurelia-bangles.jpg',
  'bridal-jewellery': '/images/aurelia-bridal.jpg',
};

export function FeaturedCategories({ categories }: { categories: Category[] }) {
  const top = categories.filter((c) => !c.parent).slice(0, 6);
  if (top.length === 0) return null;

  return (
    <section className="container-luxe py-20">
      <SectionHeading
        eyebrow="Shop by Category"
        title="Find your forever piece"
        href="/shop"
      />
      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {top.map((c) => (
          <Link key={c._id} href={`/shop?category=${c.slug}`} className="group text-center">
            <div className="relative mx-auto aspect-square overflow-hidden bg-cream">
              <Image
                src={c.image?.url && !c.image.url.includes('picsum.photos')
                  ? c.image.url
                  : (categoryImages[c.slug] ?? '/images/aurelia-craft.jpg')}
                alt={c.image?.alt ?? c.name}
                fill
                sizes="(max-width: 768px) 33vw, 16vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <p className="mt-3 font-serif text-base text-cocoa transition group-hover:text-gold">
              {c.name}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
