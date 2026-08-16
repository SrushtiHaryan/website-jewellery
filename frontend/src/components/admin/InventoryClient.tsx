'use client';

import { useEffect, useState } from 'react';
import { Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api-client';

interface InvItem {
  _id: string;
  name: string;
  sku: string;
  stock: number;
  lowStockThreshold: number;
  isActive: boolean;
}

function statusOf(item: InvItem) {
  if (item.stock === 0) return { label: 'Out of Stock', cls: 'bg-red-100 text-red-700' };
  if (item.stock <= item.lowStockThreshold) return { label: 'Low Stock', cls: 'bg-amber-100 text-amber-800' };
  return { label: 'In Stock', cls: 'bg-green-100 text-green-800' };
}

export function InventoryClient() {
  const [items, setItems] = useState<InvItem[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<InvItem[]>('/admin/inventory?limit=200')
      .then((data) => {
        setItems(data);
        setDrafts(Object.fromEntries(data.map((i) => [i._id, String(i.stock)])));
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const save = async (id: string) => {
    const stock = Number(drafts[id]);
    if (Number.isNaN(stock) || stock < 0) {
      toast.error('Enter a valid stock number.');
      return;
    }
    setSavingId(id);
    try {
      await apiFetch(`/admin/inventory/${id}`, { method: 'PATCH', body: { stock } });
      setItems((list) => list.map((i) => (i._id === id ? { ...i, stock } : i)));
      toast.success('Stock updated');
    } catch {
      toast.error('Could not update stock.');
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl text-cocoa">Inventory</h1>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-champagne/60 bg-cream/40 text-left text-xs uppercase tracking-wider text-clay">
                <th className="p-4">Product</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Status</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-right">Update</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const status = statusOf(item);
                const changed = drafts[item._id] !== String(item.stock);
                return (
                  <tr key={item._id} className="border-b border-champagne/40 last:border-0">
                    <td className="p-4 font-medium text-cocoa">{item.name}</td>
                    <td className="p-4 text-clay">{item.sku}</td>
                    <td className="p-4">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${status.cls}`}>{status.label}</span>
                    </td>
                    <td className="p-4">
                      <input
                        type="number"
                        min={0}
                        value={drafts[item._id] ?? ''}
                        onChange={(e) => setDrafts((d) => ({ ...d, [item._id]: e.target.value }))}
                        className="input w-24 py-1.5"
                      />
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => save(item._id)}
                        disabled={!changed || savingId === item._id}
                        className="btn-primary px-4 py-1.5 text-xs disabled:opacity-40"
                      >
                        {savingId === item._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                        Save
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
