import { Suspense } from 'react';
import { AdminOrdersClient } from '@/components/admin/AdminOrdersClient';

export default function AdminOrdersPage() {
  return (
    <Suspense>
      <AdminOrdersClient />
    </Suspense>
  );
}
