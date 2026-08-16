'use client';

import { useEffect, useState } from 'react';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Category } from '@/lib/types';
import { apiFetch, ApiError } from '@/lib/api-client';
import { ConfirmDialog } from './ConfirmDialog';

interface Draft {
  name: string;
  slug: string;
  description: string;
  parent: string;
  seoTitle: string;
  seoDescription: string;
  isActive: boolean;
}

const EMPTY: Draft = { name: '', slug: '', description: '', parent: '', seoTitle: '', seoDescription: '', isActive: true };

export function CategoriesClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const load = () =>
    apiFetch<Category[]>('/admin/categories').then(setCategories).catch(() => undefined);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const openAdd = () => {
    setDraft(EMPTY);
    setEditing(null);
    setAdding(true);
  };
  const openEdit = (c: Category) => {
    setDraft({
      name: c.name,
      slug: c.slug,
      description: c.description ?? '',
      parent: typeof c.parent === 'object' && c.parent ? c.parent._id : '',
      seoTitle: c.seoTitle ?? '',
      seoDescription: c.seoDescription ?? '',
      isActive: c.isActive ?? true,
    });
    setEditing(c);
    setAdding(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = {
      name: draft.name,
      slug: draft.slug || undefined,
      description: draft.description || undefined,
      parent: draft.parent || undefined,
      seoTitle: draft.seoTitle || undefined,
      seoDescription: draft.seoDescription || undefined,
      isActive: draft.isActive,
    };
    try {
      if (editing) {
        await apiFetch(`/admin/categories/${editing._id}`, { method: 'PATCH', body });
        toast.success('Category updated');
      } else {
        await apiFetch('/admin/categories', { method: 'POST', body });
        toast.success('Category created');
      }
      setAdding(false);
      setEditing(null);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not save category.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await apiFetch(`/admin/categories/${id}`, { method: 'DELETE' });
      toast.success('Category deleted');
      await load();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Could not delete category.');
    } finally {
      setConfirmId(null);
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
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-cocoa">Categories</h1>
        {!adding && (
          <button onClick={openAdd} className="btn-primary">
            <Plus className="h-4 w-4" /> New category
          </button>
        )}
      </div>

      {adding && (
        <form onSubmit={save} className="card grid gap-4 p-6 sm:grid-cols-2">
          <div>
            <label className="label">Name</label>
            <input required value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Slug (optional)</label>
            <input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} className="input" placeholder="auto-generated" />
          </div>
          <div>
            <label className="label">Parent category (optional)</label>
            <select value={draft.parent} onChange={(e) => setDraft({ ...draft, parent: e.target.value })} className="input">
              <option value="">None (top-level)</option>
              {categories
                .filter((c) => !c.parent && c._id !== editing?._id)
                .map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-cocoa">
              <input type="checkbox" checked={draft.isActive} onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })} className="h-4 w-4 accent-[#B08D57]" />
              Active
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="input min-h-20" />
          </div>
          <div>
            <label className="label">SEO title ({draft.seoTitle.length}/70)</label>
            <input maxLength={70} value={draft.seoTitle} onChange={(e) => setDraft({ ...draft, seoTitle: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">SEO description ({draft.seoDescription.length}/160)</label>
            <input maxLength={160} value={draft.seoDescription} onChange={(e) => setDraft({ ...draft, seoDescription: e.target.value })} className="input" />
          </div>
          <div className="flex gap-3 sm:col-span-2">
            <button className="btn-primary" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? 'Save changes' : 'Create category'}
            </button>
            <button type="button" onClick={() => { setAdding(false); setEditing(null); }} className="btn-ghost">Cancel</button>
          </div>
        </form>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-champagne/60 bg-cream/40 text-left text-xs uppercase tracking-wider text-clay">
                <th className="p-4">Name</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Parent</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c._id} className="border-b border-champagne/40 last:border-0">
                  <td className="p-4 font-medium text-cocoa">{c.name}</td>
                  <td className="p-4 text-clay">{c.slug}</td>
                  <td className="p-4 text-clay">
                    {typeof c.parent === 'object' && c.parent ? c.parent.name : '—'}
                  </td>
                  <td className="p-4">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${c.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(c)} className="icon-btn h-8 w-8" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => setConfirmId(c._id)} className="icon-btn h-8 w-8 text-clay hover:text-red-600" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={confirmId !== null}
        title="Delete category?"
        description="Categories with products cannot be deleted."
        confirmLabel="Delete"
        onConfirm={() => confirmId && remove(confirmId)}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
