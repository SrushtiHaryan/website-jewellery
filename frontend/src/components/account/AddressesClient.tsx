'use client';

import { useEffect, useState } from 'react';
import { Loader2, MapPin, Plus, Star, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Address } from '@/lib/types';
import { apiFetch, ApiError } from '@/lib/api-client';
import { AddressForm, type AddressInput } from './AddressForm';
import { EmptyState } from '@/components/ui/EmptyState';

export function AddressesClient() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Address | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    apiFetch<Address[]>('/users/me/addresses')
      .then(setAddresses)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const add = async (values: AddressInput) => {
    const list = await apiFetch<Address[]>('/users/me/addresses', { method: 'POST', body: values });
    setAddresses(list);
    setAdding(false);
    toast.success('Address added');
  };

  const update = async (values: AddressInput) => {
    if (!editing) return;
    const list = await apiFetch<Address[]>(`/users/me/addresses/${editing._id}`, {
      method: 'PATCH',
      body: values,
    });
    setAddresses(list);
    setEditing(null);
    toast.success('Address updated');
  };

  const remove = async (id: string) => {
    try {
      const list = await apiFetch<Address[]>(`/users/me/addresses/${id}`, { method: 'DELETE' });
      setAddresses(list);
      toast.success('Address removed');
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Could not remove address.');
    }
  };

  const setDefault = async (id: string) => {
    const list = await apiFetch<Address[]>(`/users/me/addresses/${id}/default`, { method: 'PATCH' });
    setAddresses(list);
    toast.success('Default address set');
  };

  if (loading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-3xl text-cocoa">My Addresses</h1>
        {!adding && !editing && (
          <button onClick={() => setAdding(true)} className="btn-outline">
            <Plus className="h-4 w-4" />
            Add address
          </button>
        )}
      </div>

      {(adding || editing) && (
        <div className="card mb-6 p-6">
          <h2 className="mb-4 font-serif text-xl text-cocoa">
            {editing ? 'Edit address' : 'New address'}
          </h2>
          <AddressForm
            initial={editing ?? undefined}
            onSubmit={editing ? update : add}
            onCancel={() => {
              setAdding(false);
              setEditing(null);
            }}
          />
        </div>
      )}

      {addresses.length === 0 && !adding ? (
        <EmptyState
          title="No addresses saved"
          description="Add an address to speed up checkout."
          actionLabel="Add address"
          onAction={() => setAdding(true)}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <div key={a._id} className="card p-5">
              <div className="flex items-start justify-between">
                <MapPin className="h-5 w-5 text-gold" />
                {a.isDefault && (
                  <span className="rounded-full bg-champagne px-2 py-0.5 text-[10px] uppercase tracking-wide text-cocoa">
                    Default
                  </span>
                )}
              </div>
              <p className="mt-3 font-medium text-cocoa">
                {a.fullName}
                {a.label && <span className="text-clay"> · {a.label}</span>}
              </p>
              <p className="mt-1 text-sm text-clay">
                {a.line1}
                {a.line2 ? `, ${a.line2}` : ''}, {a.city}, {a.state} {a.postalCode}
                <br />
                {a.phone}
              </p>
              <div className="mt-4 flex gap-3 text-sm">
                {!a.isDefault && (
                  <button onClick={() => setDefault(a._id)} className="inline-flex items-center gap-1 text-gold hover:underline">
                    <Star className="h-3.5 w-3.5" /> Set default
                  </button>
                )}
                <button onClick={() => setEditing(a)} className="inline-flex items-center gap-1 text-cocoa hover:underline">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button onClick={() => remove(a._id)} className="inline-flex items-center gap-1 text-clay hover:text-red-600">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
