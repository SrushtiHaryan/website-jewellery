'use client';

import { useEffect, useState } from 'react';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Collection } from '@/lib/types';
import { apiFetch, ApiError } from '@/lib/api-client';
import { ConfirmDialog } from './ConfirmDialog';

interface Draft {
  name: string;
  tagline: string;
  description: string;
  isFeatured: boolean;
  isActive: boolean;
}
const EMPTY: Draft = { name: '', tagline: '', description: '', isFeatured: false, isActive: true };

export function CollectionsClient() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Collection | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const load = () =>
    apiFetch<Collection[]>('/admin/collections').then(setCollections).catch(() => undefined);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const openEdit = (c: Collection) => {
    setDraft({
      name: c.name,
      tagline: c.tagline ?? '',
      description: c.description ?? '',
      isFeatured: c.isFeatured ?? false,
      isActive: (c as unknown as { isActive?: boolean }).isActive ?? true,
    });
    setEditing(c);
    setAdding(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = {
      name: draft.name,
      tagline: draft.tagline || undefined,
      description: draft.description || undefined,
      isFeatured: draft.isFeatured,
      isActive: draft.isActive,
    };
    try {
      if (editing) {
        await apiFetch(`/admin/collections/${editing._id}`, { method: 'PATCH', body });
        toast.success('Collection updated');
      } else {
        await apiFetch('/admin/collections', { method: 'POST', body });
        toast.success('Collection created');
      }
      setAdding(false);
      setEditing(null);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not save collection.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await apiFetch(`/admin/collections/${id}`, { method: 'DELETE' });
      toast.success('Collection deleted');
      await load();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Could not delete.');
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
        <h1 className="font-serif text-3xl text-cocoa">Collections</h1>
        {!adding && (
          <button onClick={() => { setDraft(EMPTY); setEditing(null); setAdding(true); }} className="btn-primary">
            <Plus className="h-4 w-4" /> New collection
          </button>
        )}
      </div>

      <p className="text-sm text-clay">
        Product membership is managed from each product’s “Collections” field.
      </p>

      {adding && (
        <form onSubmit={save} className="card grid gap-4 p-6 sm:grid-cols-2">
          <div>
            <label className="label">Name</label>
            <input required value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Tagline</label>
            <input value={draft.tagline} onChange={(e) => setDraft({ ...draft, tagline: e.target.value })} className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="input min-h-20" />
          </div>
          <div className="flex items-center gap-6 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm text-cocoa">
              <input type="checkbox" checked={draft.isFeatured} onChange={(e) => setDraft({ ...draft, isFeatured: e.target.checked })} className="h-4 w-4 accent-[#B08D57]" />
              Featured on homepage
            </label>
            <label className="flex items-center gap-2 text-sm text-cocoa">
              <input type="checkbox" checked={draft.isActive} onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })} className="h-4 w-4 accent-[#B08D57]" />
              Active
            </label>
          </div>
          <div className="flex gap-3 sm:col-span-2">
            <button className="btn-primary" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? 'Save changes' : 'Create collection'}
            </button>
            <button type="button" onClick={() => { setAdding(false); setEditing(null); }} className="btn-ghost">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {collections.map((c) => (
          <div key={c._id} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-serif text-xl text-cocoa">{c.name}</h3>
                {c.tagline && <p className="text-sm text-clay">{c.tagline}</p>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(c)} className="icon-btn h-8 w-8" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => setConfirmId(c._id)} className="icon-btn h-8 w-8 text-clay hover:text-red-600" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            {c.isFeatured && (
              <span className="mt-3 inline-block rounded-full bg-champagne px-2 py-0.5 text-[10px] uppercase tracking-wide text-cocoa">
                Featured
              </span>
            )}
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={confirmId !== null}
        title="Delete collection?"
        description="Products will be unlinked from this collection."
        confirmLabel="Delete"
        onConfirm={() => confirmId && remove(confirmId)}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
