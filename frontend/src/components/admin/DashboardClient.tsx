'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  IndianRupee,
  ShoppingCart,
  Users,
  Package,
  Clock,
  AlertTriangle,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { SalesChart } from './SalesChart';
import { OrderStatusBadge } from '@/components/account/OrderStatusBadge';
import { formatINR, formatDate } from '@/lib/utils';

interface Dashboard {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  recentOrders: {
    _id: string;
    orderNumber: string;
    total: number;
    orderStatus: string;
    createdAt: string;
    customer?: { name: string; email: string };
  }[];
  salesByDay: { date: string; revenue: number; orders: number }[];
}

export function DashboardClient() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Dashboard>('/admin/dashboard')
      .then(setData)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  const stats = [
    { label: 'Total Sales', value: formatINR(data.totalSales), icon: IndianRupee },
    { label: 'Orders', value: data.totalOrders, icon: ShoppingCart },
    { label: 'Customers', value: data.totalCustomers, icon: Users },
    { label: 'Products', value: data.totalProducts, icon: Package },
  ];

  const alerts = [
    { label: 'Pending orders', value: data.pendingOrders, icon: Clock, href: '/admin/orders?status=pending' },
    { label: 'Low stock', value: data.lowStockProducts, icon: AlertTriangle, href: '/admin/inventory' },
    { label: 'Out of stock', value: data.outOfStockProducts, icon: AlertTriangle, href: '/admin/inventory' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-cocoa">Dashboard</h1>
        <p className="text-sm text-clay">An overview of your store’s performance.</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-clay">{s.label}</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cream text-gold">
                <s.icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 font-serif text-3xl text-cocoa">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chart */}
        <div className="card p-6 lg:col-span-2">
          <div className="mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-gold" />
            <h2 className="font-serif text-xl text-cocoa">Revenue (last 14 days)</h2>
          </div>
          <SalesChart data={data.salesByDay} />
        </div>

        {/* Alerts */}
        <div className="space-y-4">
          {alerts.map((a) => (
            <Link key={a.label} href={a.href} className="card flex items-center justify-between p-5 transition hover:shadow-soft">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cream text-gold">
                  <a.icon className="h-4 w-4" />
                </span>
                <span className="text-sm text-cocoa">{a.label}</span>
              </div>
              <span className="font-serif text-2xl text-cocoa">{a.value}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent orders */}
      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl text-cocoa">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm text-gold hover:underline">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-champagne/60 text-left text-xs uppercase tracking-wider text-clay">
                <th className="pb-3">Order</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((o) => (
                <tr key={o._id} className="border-b border-champagne/40 last:border-0">
                  <td className="py-3">
                    <Link href={`/admin/orders/${o._id}`} className="font-medium text-cocoa hover:text-gold">
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="py-3 text-clay">{o.customer?.name ?? '—'}</td>
                  <td className="py-3 text-clay">{formatDate(o.createdAt)}</td>
                  <td className="py-3"><OrderStatusBadge status={o.orderStatus} /></td>
                  <td className="py-3 text-right font-medium text-cocoa">{formatINR(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
