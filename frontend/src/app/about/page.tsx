import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';

export const metadata: Metadata = {
  title: 'Our Story',
  description:
    'Aurelia blends centuries of Indian jewellery craftsmanship with modern design. Discover our story, values and commitment to quality.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our Story"
        title="Heritage, reimagined"
        description="Aurelia was born from a love of Indian craftsmanship and a belief that fine jewellery should be both timeless and personal."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'About', href: '/about' },
        ]}
      />

      <section className="container-luxe grid items-center gap-12 py-16 md:grid-cols-2">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
          <Image
            src="https://picsum.photos/seed/aurelia-about/800/1000"
            alt="Aurelia atelier"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div>
          <h2 className="font-serif text-3xl text-cocoa">Crafted with intention</h2>
          <p className="mt-5 leading-relaxed text-clay">
            Every Aurelia piece begins with a sketch and ends in the hands of a master artisan.
            We work with skilled craftspeople who have inherited techniques passed down through
            generations — Kundan setting, Polki work, meenakari enamelling and fine gold granulation.
          </p>
          <p className="mt-4 leading-relaxed text-clay">
            We believe luxury lies in the details: the weight of real gold, the depth of an uncut
            stone, the care in a hand-painted motif. Our collections are designed for the modern
            wardrobe while honouring the artistry of the past.
          </p>
          <Link href="/shop" className="btn-primary mt-8">Explore the collection</Link>
        </div>
      </section>

      <WhyChooseUs />

      <section className="container-luxe py-20 text-center">
        <p className="eyebrow">Our promise</p>
        <h2 className="mx-auto mt-3 max-w-2xl font-serif text-4xl leading-tight text-cocoa">
          Jewellery worth passing down
        </h2>
        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-clay">
          From certified purity to insured delivery and easy returns, we are committed to making
          every part of owning an Aurelia piece feel effortless and reassuring.
        </p>
      </section>
    </>
  );
}
