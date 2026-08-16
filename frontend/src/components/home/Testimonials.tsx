import { Quote } from 'lucide-react';
import { StarRating } from '@/components/product/StarRating';
import { SectionHeading } from '@/components/ui/SectionHeading';

const TESTIMONIALS = [
  {
    name: 'Priya M.',
    location: 'Delhi',
    rating: 5,
    text: 'My bridal set was beyond beautiful. The Kundan work is exquisite and it arrived beautifully packaged. I felt like royalty on my wedding day.',
  },
  {
    name: 'Ananya R.',
    location: 'Bengaluru',
    rating: 5,
    text: 'I wear my Aurelia jhumkas almost every day. They are light, elegant and the finish still looks brand new after months.',
  },
  {
    name: 'Sneha K.',
    location: 'Mumbai',
    rating: 5,
    text: 'Wonderful craftsmanship and genuinely helpful service. The pendant I ordered was even prettier in person.',
  },
];

export function Testimonials() {
  return (
    <section className="container-luxe py-20">
      <SectionHeading eyebrow="Loved by our customers" title="Stories worth wearing" align="center" />
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <figure key={t.name} className="card flex flex-col p-7">
            <Quote className="h-8 w-8 text-champagne" />
            <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-clay">
              “{t.text}”
            </blockquote>
            <figcaption className="mt-6 border-t border-champagne/60 pt-4">
              <StarRating rating={t.rating} showCount={false} />
              <p className="mt-2 font-serif text-lg text-cocoa">{t.name}</p>
              <p className="text-xs uppercase tracking-wider text-clay">{t.location}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
