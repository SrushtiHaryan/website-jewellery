import type { Metadata } from 'next';
import { Mail, Phone, MapPin } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { ContactForm } from '@/components/contact/ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the Aurelia team for orders, styling advice or bespoke enquiries.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="We are here to help"
        title="Contact Us"
        description="Questions about an order, styling advice or a bespoke enquiry? Our team would love to help."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Contact', href: '/contact' },
        ]}
      />
      <section className="container-luxe grid gap-12 py-16 lg:grid-cols-2">
        <div>
          <h2 className="font-serif text-2xl text-cocoa">Get in touch</h2>
          <div className="mt-6 space-y-5 text-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream text-gold">
                <Mail className="h-5 w-5" />
              </span>
              <div>
                <p className="text-clay">Email</p>
                <p className="font-medium text-cocoa">care@aurelia.example</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream text-gold">
                <Phone className="h-5 w-5" />
              </span>
              <div>
                <p className="text-clay">Phone</p>
                <p className="font-medium text-cocoa">+91 90000 00000</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream text-gold">
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <p className="text-clay">Atelier</p>
                <p className="font-medium text-cocoa">Bandra West, Mumbai, India</p>
              </div>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <ContactForm />
        </div>
      </section>
    </>
  );
}
