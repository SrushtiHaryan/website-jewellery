'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { Address } from '@/lib/types';

export type AddressInput = Omit<Address, '_id' | 'isDefault'> & { isDefault?: boolean };

export function AddressForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = 'Save address',
}: {
  initial?: Partial<Address>;
  onSubmit: (values: AddressInput) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const [values, setValues] = useState<AddressInput>({
    label: initial?.label ?? '',
    fullName: initial?.fullName ?? '',
    phone: initial?.phone ?? '',
    line1: initial?.line1 ?? '',
    line2: initial?.line2 ?? '',
    city: initial?.city ?? '',
    state: initial?.state ?? '',
    postalCode: initial?.postalCode ?? '',
    country: initial?.country ?? 'India',
    isDefault: initial?.isDefault ?? false,
  });
  const [loading, setLoading] = useState(false);

  const set = (k: keyof AddressInput) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(values);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="label">Full name</label>
        <input required value={values.fullName} onChange={set('fullName')} className="input" />
      </div>
      <div>
        <label className="label">Phone</label>
        <input required value={values.phone} onChange={set('phone')} className="input" />
      </div>
      <div>
        <label className="label">Label (e.g. Home)</label>
        <input value={values.label} onChange={set('label')} className="input" />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Address line 1</label>
        <input required value={values.line1} onChange={set('line1')} className="input" />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Address line 2 (optional)</label>
        <input value={values.line2} onChange={set('line2')} className="input" />
      </div>
      <div>
        <label className="label">City</label>
        <input required value={values.city} onChange={set('city')} className="input" />
      </div>
      <div>
        <label className="label">State</label>
        <input required value={values.state} onChange={set('state')} className="input" />
      </div>
      <div>
        <label className="label">Postal code</label>
        <input required value={values.postalCode} onChange={set('postalCode')} className="input" />
      </div>
      <div>
        <label className="label">Country</label>
        <input required value={values.country} onChange={set('country')} className="input" />
      </div>
      <label className="flex items-center gap-2 text-sm text-cocoa sm:col-span-2">
        <input
          type="checkbox"
          checked={values.isDefault}
          onChange={(e) => setValues((v) => ({ ...v, isDefault: e.target.checked }))}
          className="h-4 w-4 accent-[#B08D57]"
        />
        Set as default address
      </label>
      <div className="flex gap-3 sm:col-span-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-ghost">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
