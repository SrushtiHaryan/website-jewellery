import Image from 'next/image';
import { Instagram } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function InstagramSection() {
  const posts = [1, 2, 3, 4, 5, 6];
  return (
    <section className="container-luxe pb-24">
      <SectionHeading
        eyebrow="@aurelia"
        title="Follow our journey"
        description="Tag @aurelia to be featured. A glimpse into the atelier and the moments our jewellery becomes part of."
        align="center"
      />
      <div className="mt-10 grid grid-cols-3 gap-2 md:grid-cols-6">
        {posts.map((n) => (
          <a
            key={n}
            href="https://instagram.com"
            className="group relative aspect-square overflow-hidden rounded-xl"
            aria-label="View on Instagram"
          >
            <Image
              src={`https://picsum.photos/seed/aurelia-insta-${n}/400/400`}
              alt="Aurelia jewellery on Instagram"
              fill
              sizes="(max-width: 768px) 33vw, 16vw"
              className="object-cover transition duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition group-hover:bg-ink/40 group-hover:opacity-100">
              <Instagram className="h-6 w-6 text-ivory" />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
