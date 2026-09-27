import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Collection } from '@/lib/types';
import { SectionHeading } from '@/components/ui/SectionHeading';

const collectionImages: Record<string, string> = {
  'bridal-collection': '/images/aurelia-bridal.jpg',
  'festive-collection': '/images/aurelia-earrings.jpg',
  'everyday-elegance': '/images/aurelia-rings.jpg',
  'royal-collection': '/images/aurelia-craft.jpg',
};

export function CollectionShowcase({ collections }: { collections: Collection[] }) {
  const featured = collections.filter((c) => c.isFeatured).slice(0, 4);
  const list = (featured.length > 0 ? featured : collections).slice(0, 4);
  if (list.length === 0) return null;

  const [hero, ...rest] = list;

  return (
    <section className="bg-cream py-20">
      <div className="container-luxe">
        <SectionHeading
          eyebrow="Curated Collections"
          title="Edits for every occasion"
          description="From bridal grandeur to everyday elegance — collections crafted around the moments that matter."
        />
        <div className="mt-10 grid gap-4 lg:h-[600px] lg:grid-cols-2">
          {/* Large hero collection */}
          <CollectionCard collection={hero} large />
          <div className="grid gap-4 sm:grid-cols-2 lg:h-full lg:auto-rows-fr lg:grid-cols-1">
            {rest.map((c) => (
              <CollectionCard key={c._id} collection={c} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CollectionCard({ collection, large }: { collection: Collection; large?: boolean }) {
  return (
    <Link
      href={`/collections/${collection.slug}`}
      className={`group relative overflow-hidden ${large ? 'aspect-[4/5] lg:aspect-auto lg:h-full' : 'aspect-[16/9] lg:aspect-auto lg:h-full'}`}
    >
      <Image
        src={collection.image?.url && !collection.image.url.includes('picsum.photos')
          ? collection.image.url
          : (collectionImages[collection.slug] ?? '/images/aurelia-craft.jpg')}
        alt={collection.image?.alt ?? collection.name}
        fill
        sizes={large ? '(max-width: 1024px) 100vw, 50vw' : '(max-width: 1024px) 50vw, 25vw'}
        className="object-cover transition duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-6">
        {collection.tagline && (
          <p className="text-xs uppercase tracking-luxe text-ivory/80">{collection.tagline}</p>
        )}
        <h3 className={`mt-1 font-serif text-ivory ${large ? 'text-3xl md:text-4xl' : 'text-2xl'}`}>
          {collection.name}
        </h3>
        <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-ivory">
          Discover <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
