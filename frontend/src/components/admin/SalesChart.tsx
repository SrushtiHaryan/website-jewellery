'use client';

import { formatINR } from '@/lib/utils';

export function SalesChart({ data }: { data: { date: string; revenue: number; orders: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-clay">
        No sales in the last 14 days yet.
      </div>
    );
  }
  const max = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div className="flex h-52 items-end gap-2">
      {data.map((d) => {
        const heightPct = Math.max(4, (d.revenue / max) * 100);
        const label = new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        return (
          <div key={d.date} className="group flex flex-1 flex-col items-center gap-2">
            <div className="relative flex w-full flex-1 items-end">
              <div
                className="w-full rounded-t bg-gold/70 transition group-hover:bg-gold"
                style={{ height: `${heightPct}%` }}
              />
              <div className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-cocoa px-2 py-1 text-[10px] text-ivory opacity-0 transition group-hover:opacity-100">
                {formatINR(d.revenue)} · {d.orders} order{d.orders > 1 ? 's' : ''}
              </div>
            </div>
            <span className="text-[9px] text-clay">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
