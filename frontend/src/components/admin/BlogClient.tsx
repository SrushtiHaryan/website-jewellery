'use client';

import { useEffect, useState } from 'react';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { BlogPost } from '@/lib/types';
import { apiFetch, ApiError } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';
import { ConfirmDialog } from './ConfirmDialog';

interface Draft {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string;
  featuredImageUrl: string;
  seoTitle: string;
  seoDescription: string;
  isPublished: boolean;
}
const EMPTY: Draft = {
  title: '', excerpt: '', content: '', category: '', tags: '',
  featuredImageUrl: '', seoTitle: '', seoDescription: '', isPublished: false,
};

export function BlogClient() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const load = () =>
    apiFetch<BlogPost[]>('/admin/blog?limit=100').then(setPosts).catch(() => undefined);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const openEdit = async (p: BlogPost) => {
    // The list endpoint omits content; fetch the full post for editing.
    try {
      const full = await apiFetch<BlogPost>(`/admin/blog/${p._id}`);
      setDraft({
        title: full.title,
        excerpt: full.excerpt ?? '',
        content: full.content,
        category: full.category ?? '',
        tags: (full.tags ?? []).join(', '),
        featuredImageUrl: full.featuredImage?.url ?? '',
        seoTitle: full.seoTitle ?? '',
        seoDescription: full.seoDescription ?? '',
        isPublished: (full as unknown as { isPublished?: boolean }).isPublished ?? false,
      });
      setEditing(full);
      setAdding(true);
    } catch {
      toast.error('Could not load article.');
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = {
      title: draft.title,
      excerpt: draft.excerpt || undefined,
      content: draft.content,
      category: draft.category || undefined,
      tags: draft.tags.split(',').map((t) => t.trim()).filter(Boolean),
      featuredImage: draft.featuredImageUrl ? { url: draft.featuredImageUrl, alt: draft.title } : undefined,
      seoTitle: draft.seoTitle || undefined,
      seoDescription: draft.seoDescription || undefined,
      isPublished: draft.isPublished,
    };
    try {
      if (editing) {
        await apiFetch(`/admin/blog/${editing._id}`, { method: 'PATCH', body });
        toast.success('Article updated');
      } else {
        await apiFetch('/admin/blog', { method: 'POST', body });
        toast.success('Article created');
      }
      setAdding(false);
      setEditing(null);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not save article.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await apiFetch(`/admin/blog/${id}`, { method: 'DELETE' });
      toast.success('Article deleted');
      await load();
    } catch {
      toast.error('Could not delete article.');
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

  if (adding) {
    return (
      <form onSubmit={save} className="max-w-3xl space-y-5">
        <h1 className="font-serif text-3xl text-cocoa">{editing ? 'Edit article' : 'New article'}</h1>
        <div className="card space-y-4 p-6">
          <div>
            <label className="label">Title</label>
            <input required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="input" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Category</label>
              <input value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Tags (comma separated)</label>
              <input value={draft.tags} onChange={(e) => setDraft({ ...draft, tags: e.target.value })} className="input" />
            </div>
          </div>
          <div>
            <label className="label">Featured image URL</label>
            <input value={draft.featuredImageUrl} onChange={(e) => setDraft({ ...draft, featuredImageUrl: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Excerpt</label>
            <textarea value={draft.excerpt} onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })} className="input min-h-16" />
          </div>
          <div>
            <label className="label">Content</label>
            <textarea required value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })} className="input min-h-48" placeholder="Separate paragraphs with line breaks." />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">SEO title ({draft.seoTitle.length}/70)</label>
              <input maxLength={70} value={draft.seoTitle} onChange={(e) => setDraft({ ...draft, seoTitle: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">SEO description ({draft.seoDescription.length}/160)</label>
              <input maxLength={160} value={draft.seoDescription} onChange={(e) => setDraft({ ...draft, seoDescription: e.target.value })} className="input" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-cocoa">
            <input type="checkbox" checked={draft.isPublished} onChange={(e) => setDraft({ ...draft, isPublished: e.target.checked })} className="h-4 w-4 accent-[#B08D57]" />
            Published
          </label>
        </div>
        <div className="flex gap-3">
          <button className="btn-primary" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {editing ? 'Save changes' : 'Create article'}
          </button>
          <button type="button" onClick={() => { setAdding(false); setEditing(null); }} className="btn-ghost">Cancel</button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-cocoa">Journal</h1>
        <button onClick={() => { setDraft(EMPTY); setEditing(null); setAdding(true); }} className="btn-primary">
          <Plus className="h-4 w-4" /> New article
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-champagne/60 bg-cream/40 text-left text-xs uppercase tracking-wider text-clay">
                <th className="p-4">Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p._id} className="border-b border-champagne/40 last:border-0">
                  <td className="p-4 font-medium text-cocoa">{p.title}</td>
                  <td className="p-4 text-clay">{p.category ?? '—'}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${(p as unknown as { isPublished?: boolean }).isPublished ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                      {(p as unknown as { isPublished?: boolean }).isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="p-4 text-clay">{p.publishedAt ? formatDate(p.publishedAt) : formatDate(p.createdAt)}</td>
                  <td className="p-4">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(p)} className="icon-btn h-8 w-8" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => setConfirmId(p._id)} className="icon-btn h-8 w-8 text-clay hover:text-red-600" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
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
        title="Delete article?"
        confirmLabel="Delete"
        onConfirm={() => confirmId && remove(confirmId)}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
