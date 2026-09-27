import Image from 'next/image';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function InstagramSection() {
  const posts = [
    ['/images/aurelia-craft.jpg', 'Kundan necklace and earrings'],
    ['/images/aurelia-earrings.jpg', 'Traditional gold jhumka earrings'],
    ['/images/aurelia-detail.jpg', 'Artisan setting a Polki stone'],
    ['/images/aurelia-bangles.jpg', 'Kundan bangles'],
    ['/images/aurelia-bridal.jpg', 'Bridal jewellery'],
    ['/images/aurelia-rings.jpg', 'Emerald statement ring'],
  ] as const;
  return (
    <section className="container-luxe pb-24">
      <SectionHeading
        eyebrow="From the atelier"
        title="A closer look"
        description="Details of the pieces and the craft behind them."
        align="center"
      />
      <div className="mt-10 grid grid-cols-3 gap-2 md:grid-cols-6">
        {posts.map(([src, alt]) => (
          <div key={src} className="relative aspect-square overflow-hidden">
            <Image
              src={src}
              alt={alt}
              fill
              sizes="(max-width: 768px) 33vw, 16vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
