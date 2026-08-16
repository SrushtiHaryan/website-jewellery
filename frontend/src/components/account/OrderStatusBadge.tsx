import { ORDER_STATUS_LABELS } from '@/lib/utils';
import type { OrderStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

const STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-blue-100 text-blue-800',
  packed: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-violet-100 text-violet-800',
  out_for_delivery: 'bg-violet-100 text-violet-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-700',
  returned: 'bg-orange-100 text-orange-800',
  refunded: 'bg-gray-200 text-gray-700',
};

export function OrderStatusBadge({ status }: { status: OrderStatus | string }) {
  return (
    <span
      className={cn(
        'inline-block rounded-full px-2.5 py-1 text-xs font-medium',
        STYLES[status] ?? 'bg-cream text-cocoa'
      )}
    >
      {ORDER_STATUS_LABELS[status] ?? status}
    </span>
  );
}
