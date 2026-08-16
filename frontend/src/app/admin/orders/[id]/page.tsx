import { AdminOrderDetailClient } from '@/components/admin/AdminOrderDetailClient';

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  return <AdminOrderDetailClient orderId={params.id} />;
}
