import type { Metadata } from 'next';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { CheckoutClient } from '@/components/checkout/CheckoutClient';

export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <RequireAuth>
      <CheckoutClient />
    </RequireAuth>
  );
}
