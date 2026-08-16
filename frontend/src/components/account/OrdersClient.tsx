'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, ChevronRight } from 'lucide-react';
import type { Order } from '@/lib/types';
import { apiFetch } from '@/lib/api-client';
import { EmptyState } from '@/components/ui/EmptyState';
import { OrderStatusBadge } from './OrderStatusBadge';
import { formatINR, formatDate } from '@/lib/utils';

export function OrdersClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Order[]>('/orders?limit=50')
      .then(setOrders)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl text-cocoa">My Orders</h1>
      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="When you place an order, it will appear here."
          actionLabel="Start shopping"
          onAction={() => (window.location.href = '/shop')}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <Link
              key={o._id}
              href={`/account/orders/${o._id}`}
              className="card flex items-center justify-between p-5 transition hover:shadow-soft"
            >
              <div>
                <div className="flex items-center gap-3">
                  <p className="font-medium text-cocoa">{o.orderNumber}</p>
                  <OrderStatusBadge status={o.orderStatus} />
                </div>
                <p className="mt-1 text-sm text-clay">
                  {formatDate(o.createdAt)} · {o.items.length} item{o.items.length > 1 ? 's' : ''} ·{' '}
                  {formatINR(o.total)}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-clay" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
