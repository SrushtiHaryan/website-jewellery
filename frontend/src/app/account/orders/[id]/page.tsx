import { Suspense } from 'react';
import { OrderDetailClient } from '@/components/account/OrderDetailClient';

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense>
      <OrderDetailClient orderId={params.id} />
    </Suspense>
  );
}
