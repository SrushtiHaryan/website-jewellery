import { formatINR } from '@/lib/utils';

export function OrderSummary({
  pricing,
  children,
}: {
  pricing: { subtotal: number; discount: number; shipping: number; tax: number; total: number };
  children?: React.ReactNode;
}) {
  const rows = [
    { label: 'Subtotal', value: formatINR(pricing.subtotal) },
    ...(pricing.discount > 0
      ? [{ label: 'Discount', value: `– ${formatINR(pricing.discount)}`, accent: true }]
      : []),
    {
      label: 'Shipping',
      value: pricing.shipping === 0 ? 'Free' : formatINR(pricing.shipping),
    },
    { label: 'GST (3%)', value: formatINR(pricing.tax) },
  ];

  return (
    <div className="card p-6">
      <h2 className="font-serif text-2xl text-cocoa">Order Summary</h2>
      <dl className="mt-5 space-y-3 text-sm">
        {rows.map((r) => (
          <div key={r.label} className="flex justify-between">
            <dt className="text-clay">{r.label}</dt>
            <dd className={'accent' in r && r.accent ? 'text-gold' : 'text-cocoa'}>{r.value}</dd>
          </div>
        ))}
        <div className="flex justify-between border-t border-champagne/60 pt-3">
          <dt className="font-medium text-cocoa">Total</dt>
          <dd className="font-serif text-xl text-cocoa">{formatINR(pricing.total)}</dd>
        </div>
      </dl>
      {children}
    </div>
  );
}
