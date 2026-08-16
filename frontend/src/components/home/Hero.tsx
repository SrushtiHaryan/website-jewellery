import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-cream">
      <div className="container-luxe grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
        {/* Copy */}
        <div className="animate-fade-up">
          <p className="eyebrow">Aurelia Fine Jewellery</p>
          <h1 className="mt-4 font-serif text-5xl leading-[1.05] text-cocoa md:text-6xl lg:text-7xl">
            Timeless Jewellery,
            <br />
            <span className="italic text-gold">Crafted for Every Story</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-clay">
            Heritage Kundan, Polki and temple gold — reimagined with modern elegance.
            Each piece is hand-finished by master craftspeople to be treasured for generations.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/shop" className="btn-primary">
              Shop the Collection
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/shop?newArrival=true" className="btn-outline">
              Explore New Arrivals
            </Link>
          </div>
          <div className="mt-10 flex gap-8">
            {[
              ['BIS', 'Hallmarked'],
              ['Free', 'Shipping ₹2k+'],
              ['15-Day', 'Easy Returns'],
            ].map(([a, b]) => (
              <div key={b}>
                <p className="font-serif text-2xl text-cocoa">{a}</p>
                <p className="text-xs uppercase tracking-wider text-clay">{b}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Image */}
        <div className="relative animate-fade-in">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-soft md:aspect-[3/4]">
            <Image
              src="https://picsum.photos/seed/aurelia-hero/1000/1250"
              alt="Model wearing an Aurelia Kundan bridal necklace"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-champagne bg-ivory/95 p-5 shadow-soft backdrop-blur md:block">
            <p className="font-serif text-lg text-cocoa">The Bridal Edit</p>
            <p className="text-xs text-clay">Handcrafted heirlooms</p>
          </div>
        </div>
      </div>
    </section>
  );
}
