import { ShieldCheck, Gem, Truck, RefreshCw } from 'lucide-react';

const ITEMS = [
  {
    icon: Gem,
    title: 'Certified Craftsmanship',
    text: 'BIS hallmarked gold and ethically sourced stones, certified for purity.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Payments',
    text: 'Encrypted checkout with trusted payment partners and buyer protection.',
  },
  {
    icon: Truck,
    title: 'Insured Delivery',
    text: 'Complimentary, fully insured shipping on every order over ₹2,000.',
  },
  {
    icon: RefreshCw,
    title: 'Easy 15-Day Returns',
    text: 'Changed your mind? Return unworn pieces within 15 days, hassle-free.',
  },
];

export function WhyChooseUs() {
  return (
    <section className="border-y border-champagne/60 bg-ivory py-16">
      <div className="container-luxe grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((item) => (
          <div key={item.title} className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cream text-gold">
              <item.icon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-serif text-xl text-cocoa">{item.title}</h3>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-clay">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
