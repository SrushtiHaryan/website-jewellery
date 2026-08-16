'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2, Search } from 'lucide-react';
import type { Order } from '@/lib/types';
import { apiFetch } from '@/lib/api-client';
import { OrderStatusBadge } from '@/components/account/OrderStatusBadge';
import { ORDER_STATUS_LABELS, formatINR, formatDate } from '@/lib/utils';

const STATUSES = Object.keys(ORDER_STATUS_LABELS);

export function AdminOrdersClient() {
  const params = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState(params.get('status') ?? '');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (st: string, q: string) => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ limit: '50' });
      if (st) qs.set('status', st);
      if (q) qs.set('search', q);
      const data = await apiFetch<Order[]>(`/admin/orders?${qs.toString()}`);
      setOrders(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(status, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl text-cocoa">Orders</h1>

      <div className="flex flex-wrap items-center gap-3">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input w-auto py-2 text-sm">
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
          ))}
        </select>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load(status, search);
          }}
          className="relative max-w-xs flex-1"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-clay" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order number…" className="input pl-10" />
        </form>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gold" />
          </div>
        ) : orders.length === 0 ? (
          <p className="p-8 text-center text-sm text-clay">No orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-champagne/60 bg-cream/40 text-left text-xs uppercase tracking-wider text-clay">
                  <th className="p-4">Order</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const customer = typeof o.customer === 'object' ? o.customer : null;
                  return (
                    <tr key={o._id} className="border-b border-champagne/40 last:border-0">
                      <td className="p-4">
                        <Link href={`/admin/orders/${o._id}`} className="font-medium text-cocoa hover:text-gold">
                          {o.orderNumber}
                        </Link>
                      </td>
                      <td className="p-4 text-clay">{customer?.name ?? '—'}</td>
                      <td className="p-4 text-clay">{formatDate(o.createdAt)}</td>
                      <td className="p-4 capitalize text-clay">{o.paymentStatus}</td>
                      <td className="p-4"><OrderStatusBadge status={o.orderStatus} /></td>
                      <td className="p-4 text-right font-medium text-cocoa">{formatINR(o.total)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
