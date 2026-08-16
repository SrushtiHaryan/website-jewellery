'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import type { Order } from '@/lib/types';
import { apiFetch, ApiError } from '@/lib/api-client';
import { OrderTracking } from './OrderTracking';
import { OrderStatusBadge } from './OrderStatusBadge';
import { OrderSummary } from '@/components/cart/OrderSummary';
import { formatINR, formatDate } from '@/lib/utils';

export function OrderDetailClient({ orderId }: { orderId: string }) {
  const params = useSearchParams();
  const justPlaced = params.get('placed') === '1';
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    apiFetch<Order>(`/orders/${orderId}`)
      .then(setOrder)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [orderId]);

  const cancel = async () => {
    if (!order) return;
    setCancelling(true);
    try {
      const updated = await apiFetch<Order>(`/orders/${order._id}/cancel`, {
        method: 'POST',
        body: { reason: 'Cancelled by customer' },
      });
      setOrder(updated);
      toast.success('Order cancelled');
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Could not cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center">
        <p className="text-clay">Order not found.</p>
        <Link href="/account/orders" className="mt-4 inline-block text-gold hover:underline">
          Back to orders
        </Link>
      </div>
    );
  }

  const canCancel = ['pending', 'confirmed'].includes(order.orderStatus);

  return (
    <div className="space-y-8">
      <Link href="/account/orders" className="inline-flex items-center gap-1.5 text-sm text-clay hover:text-gold">
        <ArrowLeft className="h-4 w-4" />
        All orders
      </Link>

      {justPlaced && (
        <div className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-5">
          <CheckCircle2 className="mt-0.5 h-6 w-6 text-green-600" />
          <div>
            <p className="font-serif text-xl text-cocoa">Thank you for your order!</p>
            <p className="text-sm text-clay">
              Your order {order.orderNumber} has been placed. A confirmation has been sent to your email.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-cocoa">{order.orderNumber}</h1>
          <p className="text-sm text-clay">
            Placed on {formatDate(order.createdAt)}
            {order.estimatedDeliveryDate && order.orderStatus !== 'delivered' && (
              <> · Est. delivery {formatDate(order.estimatedDeliveryDate)}</>
            )}
          </p>
        </div>
        <OrderStatusBadge status={order.orderStatus} />
      </div>

      {/* Tracking */}
      <div className="card p-6">
        <h2 className="mb-6 font-serif text-xl text-cocoa">Order Tracking</h2>
        <OrderTracking status={order.orderStatus} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* Items */}
          <div className="card p-6">
            <h2 className="mb-4 font-serif text-xl text-cocoa">Items</h2>
            <div className="divide-y divide-champagne/60">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-4 py-4">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-cream">
                    {item.image && (
                      <Image src={item.image} alt={item.productName} fill sizes="64px" className="object-cover" />
                    )}
                  </div>
                  <div className="flex flex-1 justify-between">
                    <div className="text-sm">
                      <Link href={`/jewellery/${item.slug}`} className="font-medium text-cocoa hover:text-gold">
                        {item.productName}
                      </Link>
                      {item.size && <p className="text-clay">Size: {item.size}</p>}
                      <p className="text-clay">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-cocoa">{formatINR(item.lineTotal)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Address */}
          <div className="card p-6">
            <h2 className="mb-3 font-serif text-xl text-cocoa">Shipping Address</h2>
            <p className="text-sm text-clay">
              <span className="font-medium text-cocoa">{order.shippingAddress.fullName}</span>
              <br />
              {order.shippingAddress.line1}
              {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              <br />
              {order.shippingAddress.country} · {order.shippingAddress.phone}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <OrderSummary pricing={order} />
          <div className="card p-6 text-sm">
            <h2 className="mb-3 font-serif text-xl text-cocoa">Payment</h2>
            <div className="flex justify-between">
              <span className="text-clay">Method</span>
              <span className="uppercase text-cocoa">{order.paymentMethod}</span>
            </div>
            <div className="mt-2 flex justify-between">
              <span className="text-clay">Status</span>
              <span className="capitalize text-cocoa">{order.paymentStatus}</span>
            </div>
          </div>
          {canCancel && (
            <button onClick={cancel} disabled={cancelling} className="btn-outline w-full">
              {cancelling && <Loader2 className="h-4 w-4 animate-spin" />}
              Cancel order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
