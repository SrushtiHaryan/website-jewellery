import Image from 'next/image';
import Link from 'next/link';

export function BrandStory() {
  return (
    <section className="container-luxe py-20">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div className="relative order-2 grid grid-cols-2 gap-4 md:order-1">
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
            <Image
              src="https://picsum.photos/seed/aurelia-craft-1/600/800"
              alt="A craftsperson setting Kundan stones by hand"
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover"
            />
          </div>
          <div className="relative mt-8 aspect-[3/4] overflow-hidden rounded-2xl">
            <Image
              src="https://picsum.photos/seed/aurelia-craft-2/600/800"
              alt="Detail of finished gold jewellery"
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover"
            />
          </div>
        </div>

        <div className="order-1 md:order-2">
          <p className="eyebrow">Our Craft</p>
          <h2 className="mt-3 font-serif text-4xl leading-tight text-cocoa">
            Heritage in every hand-set stone
          </h2>
          <p className="mt-5 leading-relaxed text-clay">
            For generations, Indian artisans have perfected the arts of Kundan, Polki and
            meenakari — setting uncut stones in gold, painting enamel by hand, and finishing
            each piece with extraordinary care.
          </p>
          <p className="mt-4 leading-relaxed text-clay">
            At Aurelia, we honour that legacy while designing for the way you live today.
            The result is jewellery that feels both timeless and entirely your own.
          </p>
          <Link href="/about" className="btn-outline mt-8">
            Read our story
          </Link>
        </div>
      </div>
    </section>
  );
}
