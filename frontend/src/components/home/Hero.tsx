import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative isolate min-h-[580px] overflow-hidden bg-cocoa md:min-h-[680px]">
      <Image
        src="/images/aurelia-bridal.jpg"
        alt="Bride wearing traditional Kundan and Polki jewellery"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[68%_center] md:object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-cocoa/95 via-cocoa/70 to-transparent md:via-cocoa/35" />
      <div className="container-luxe relative flex min-h-[580px] items-center py-20 md:min-h-[680px]">
        <div className="max-w-xl animate-fade-up">
          <p className="eyebrow text-champagne">Aurelia Fine Jewellery</p>
          <h1 className="mt-5 font-serif text-5xl leading-[1.05] text-ivory sm:text-6xl lg:text-7xl">
            Heirlooms for <span className="italic text-champagne">every chapter.</span>
          </h1>
          <p className="mt-7 max-w-md text-base leading-relaxed text-ivory/90 md:text-lg">
            Discover the beauty of Kundan, Polki and temple jewellery — traditions to treasure, made for the moments that become memories.
          </p>
          <Link href="/shop" className="btn-gold mt-9 rounded-none px-8 py-4 uppercase tracking-luxe">
            Explore the collection <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
