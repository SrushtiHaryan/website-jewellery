'use client';

import { PackageOpen } from 'lucide-react';

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-champagne bg-cream/40 px-6 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cream text-gold">
        {icon ?? <PackageOpen className="h-6 w-6" />}
      </div>
      <h3 className="mt-4 font-serif text-2xl text-cocoa">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-clay">{description}</p>}
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-outline mt-6">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
