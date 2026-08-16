'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Order, OrderStatus } from '@/lib/types';
import { apiFetch, ApiError } from '@/lib/api-client';
import { OrderStatusBadge } from '@/components/account/OrderStatusBadge';
import { OrderSummary } from '@/components/cart/OrderSummary';
import { ORDER_STATUS_LABELS, formatINR, formatDate } from '@/lib/utils';

const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

// Valid next statuses mirror the backend state machine.
const NEXT: Record<string, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['packed', 'cancelled'],
  packed: ['shipped', 'cancelled'],
  shipped: ['out_for_delivery', 'returned'],
  out_for_delivery: ['delivered', 'returned'],
  delivered: ['returned', 'refunded'],
  cancelled: [],
  returned: ['refunded'],
  refunded: [],
};

export function AdminOrderDetailClient({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch<Order>(`/admin/orders/${orderId}`)
      .then(setOrder)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [orderId]);

  const updateStatus = async (status: OrderStatus) => {
    setSaving(true);
    try {
      const updated = await apiFetch<Order>(`/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: { status },
      });
      setOrder(updated);
      toast.success('Order status updated');
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Could not update status.');
    } finally {
      setSaving(false);
    }
  };

  const updatePayment = async (paymentStatus: string) => {
    setSaving(true);
    try {
      const updated = await apiFetch<Order>(`/admin/orders/${orderId}/payment`, {
        method: 'PATCH',
        body: { paymentStatus },
      });
      setOrder(updated);
      toast.success('Payment status updated');
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Could not update payment.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }
  if (!order) return <p className="text-clay">Order not found.</p>;

  const customer = typeof order.customer === 'object' ? order.customer : null;
  const nextStatuses = NEXT[order.orderStatus] ?? [];

  return (
    <div className="space-y-6">
      <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-sm text-clay hover:text-gold">
        <ArrowLeft className="h-4 w-4" /> All orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-cocoa">{order.orderNumber}</h1>
          <p className="text-sm text-clay">Placed {formatDate(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.orderStatus} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* Status management */}
          <div className="card p-6">
            <h2 className="mb-4 font-serif text-xl text-cocoa">Manage order</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Advance status to</label>
                {nextStatuses.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {nextStatuses.map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(s)}
                        disabled={saving}
                        className="btn-outline px-3 py-1.5 text-xs"
                      >
                        {ORDER_STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-clay">No further transitions available.</p>
                )}
              </div>
              <div>
                <label className="label">Payment status</label>
                <select
                  value={order.paymentStatus}
                  onChange={(e) => updatePayment(e.target.value)}
                  disabled={saving}
                  className="input"
                >
                  {PAYMENT_STATUSES.map((s) => (
                    <option key={s} value={s} className="capitalize">{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="card p-6">
            <h2 className="mb-4 font-serif text-xl text-cocoa">Items</h2>
            <div className="divide-y divide-champagne/60">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-4 py-4">
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-cream">
                    {item.image && <Image src={item.image} alt={item.productName} fill sizes="56px" className="object-cover" />}
                  </div>
                  <div className="flex flex-1 justify-between text-sm">
                    <div>
                      <p className="font-medium text-cocoa">{item.productName}</p>
                      <p className="text-clay">{item.sku} · Qty {item.quantity}{item.size ? ` · Size ${item.size}` : ''}</p>
                    </div>
                    <p className="font-medium text-cocoa">{formatINR(item.lineTotal)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="card p-6">
            <h2 className="mb-4 font-serif text-xl text-cocoa">History</h2>
            <ol className="space-y-3">
              {order.timeline.map((t, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <span className="h-2 w-2 rounded-full bg-gold" />
                  <span className="font-medium text-cocoa">{ORDER_STATUS_LABELS[t.status]}</span>
                  {t.note && <span className="text-clay">· {t.note}</span>}
                  <span className="ml-auto text-xs text-clay">{formatDate(t.at)}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6 text-sm">
            <h2 className="mb-3 font-serif text-xl text-cocoa">Customer</h2>
            <p className="font-medium text-cocoa">{customer?.name}</p>
            <p className="text-clay">{customer?.email}</p>
          </div>
          <div className="card p-6 text-sm">
            <h2 className="mb-3 font-serif text-xl text-cocoa">Shipping</h2>
            <p className="text-clay">
              {order.shippingAddress.fullName}<br />
              {order.shippingAddress.line1}{order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
              {order.shippingAddress.phone}
            </p>
          </div>
          <OrderSummary pricing={order} />
        </div>
      </div>
    </div>
  );
}
