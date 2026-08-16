'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search, Pencil, Trash2, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@/lib/types';
import { apiFetch, ApiError } from '@/lib/api-client';
import { formatINR } from '@/lib/utils';
import { ConfirmDialog } from './ConfirmDialog';

export function ProductsClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const load = useCallback(async (q = '') => {
    setLoading(true);
    try {
      const data = await apiFetch<Product[]>(`/admin/products?limit=100${q ? `&search=${encodeURIComponent(q)}` : ''}`);
      setProducts(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleActive = async (p: Product) => {
    try {
      await apiFetch(`/admin/products/${p._id}/active`, {
        method: 'PATCH',
        body: { isActive: !p.isActive },
      });
      setProducts((list) => list.map((x) => (x._id === p._id ? { ...x, isActive: !x.isActive } : x)));
    } catch {
      toast.error('Could not update status.');
    }
  };

  const remove = async (id: string) => {
    try {
      await apiFetch(`/admin/products/${id}`, { method: 'DELETE' });
      setProducts((list) => list.filter((x) => x._id !== id));
      toast.success('Product deleted');
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Could not delete product.');
    } finally {
      setConfirmId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl text-cocoa">Products</h1>
        <Link href="/admin/products/new" className="btn-primary">
          <Plus className="h-4 w-4" />
          New product
        </Link>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          load(search);
        }}
        className="relative max-w-sm"
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-clay" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or SKU…"
          className="input pl-10"
        />
      </form>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gold" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-champagne/60 bg-cream/40 text-left text-xs uppercase tracking-wider text-clay">
                  <th className="p-4">Product</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-b border-champagne/40 last:border-0">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded bg-cream">
                          {p.images?.[0] && (
                            <Image src={p.images[0].url} alt={p.images[0].alt} fill sizes="40px" className="object-cover" />
                          )}
                        </div>
                        <span className="font-medium text-cocoa">{p.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-clay">{p.sku}</td>
                    <td className="p-4 text-cocoa">{formatINR(p.finalPrice ?? p.price)}</td>
                    <td className="p-4">
                      <span className={p.stock === 0 ? 'text-red-600' : p.stock <= 5 ? 'text-gold' : 'text-cocoa'}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          p.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => toggleActive(p)} className="icon-btn h-8 w-8" aria-label="Toggle active">
                          {p.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                        <Link href={`/admin/products/${p._id}`} className="icon-btn h-8 w-8" aria-label="Edit">
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => setConfirmId(p._id)}
                          className="icon-btn h-8 w-8 text-clay hover:text-red-600"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmId !== null}
        title="Delete product?"
        description="This permanently removes the product. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => confirmId && remove(confirmId)}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
