import { Check } from 'lucide-react';
import type { OrderStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

const FLOW: { status: OrderStatus; label: string }[] = [
  { status: 'pending', label: 'Ordered' },
  { status: 'confirmed', label: 'Confirmed' },
  { status: 'processing', label: 'Processing' },
  { status: 'packed', label: 'Packed' },
  { status: 'shipped', label: 'Shipped' },
  { status: 'out_for_delivery', label: 'Out for Delivery' },
  { status: 'delivered', label: 'Delivered' },
];

export function OrderTracking({ status }: { status: OrderStatus }) {
  if (status === 'cancelled' || status === 'returned' || status === 'refunded') {
    const label =
      status === 'cancelled' ? 'Order Cancelled' : status === 'returned' ? 'Order Returned' : 'Order Refunded';
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center text-sm text-red-700">
        {label}
      </div>
    );
  }

  const currentIndex = FLOW.findIndex((s) => s.status === status);

  return (
    <div className="overflow-x-auto no-scrollbar">
      <div className="flex min-w-[560px] items-start">
        {FLOW.map((step, i) => {
          const done = i <= currentIndex;
          const active = i === currentIndex;
          return (
            <div key={step.status} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                <div className={cn('h-0.5 flex-1', i === 0 ? 'bg-transparent' : done ? 'bg-gold' : 'bg-champagne')} />
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs',
                    done
                      ? 'border-gold bg-gold text-ivory'
                      : 'border-champagne bg-ivory text-clay',
                    active && 'ring-4 ring-gold/20'
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <div
                  className={cn(
                    'h-0.5 flex-1',
                    i === FLOW.length - 1 ? 'bg-transparent' : i < currentIndex ? 'bg-gold' : 'bg-champagne'
                  )}
                />
              </div>
              <span className={cn('mt-2 text-center text-[11px]', done ? 'font-medium text-cocoa' : 'text-clay')}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
