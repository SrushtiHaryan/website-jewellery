'use client';

import { AlertTriangle } from 'lucide-react';

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/50" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-2xl bg-ivory p-6 shadow-soft">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <h3 className="mt-4 font-serif text-2xl text-cocoa">{title}</h3>
        {description && <p className="mt-2 text-sm text-clay">{description}</p>}
        <div className="mt-6 flex gap-3">
          <button onClick={onCancel} className="btn-outline flex-1">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="btn flex-1 bg-red-600 px-7 py-3 text-white hover:bg-red-700"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
