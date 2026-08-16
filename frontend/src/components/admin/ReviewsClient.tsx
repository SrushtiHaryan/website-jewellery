'use client';

import { useEffect, useState } from 'react';
import { Loader2, Check, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api-client';
import { StarRating } from '@/components/product/StarRating';
import { formatDate } from '@/lib/utils';
import { ConfirmDialog } from './ConfirmDialog';

interface AdminReview {
  _id: string;
  rating: number;
  title?: string;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  user?: { name: string; email: string };
  product?: { name: string; slug: string };
}

export function ReviewsClient() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const load = () =>
    apiFetch<AdminReview[]>('/admin/reviews?limit=100').then(setReviews).catch(() => undefined);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const setApproval = async (id: string, isApproved: boolean) => {
    try {
      await apiFetch(`/admin/reviews/${id}`, { method: 'PATCH', body: { isApproved } });
      setReviews((list) => list.map((r) => (r._id === id ? { ...r, isApproved } : r)));
      toast.success(isApproved ? 'Review approved' : 'Review hidden');
    } catch {
      toast.error('Could not update review.');
    }
  };

  const remove = async (id: string) => {
    try {
      await apiFetch(`/admin/reviews/${id}`, { method: 'DELETE' });
      setReviews((list) => list.filter((r) => r._id !== id));
      toast.success('Review deleted');
    } catch {
      toast.error('Could not delete review.');
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
      <h1 className="font-serif text-3xl text-cocoa">Reviews</h1>
      {reviews.length === 0 ? (
        <p className="text-sm text-clay">No reviews yet.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <StarRating rating={r.rating} showCount={false} />
                    <span className={`rounded-full px-2 py-0.5 text-xs ${r.isApproved ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                      {r.isApproved ? 'Published' : 'Hidden'}
                    </span>
                  </div>
                  {r.title && <p className="mt-2 font-medium text-cocoa">{r.title}</p>}
                  <p className="mt-1 text-sm text-clay">{r.comment}</p>
                  <p className="mt-2 text-xs text-clay">
                    {r.user?.name ?? 'User'} · {r.product?.name ?? 'Product'} · {formatDate(r.createdAt)}
                  </p>
                </div>
                <div className="flex gap-1">
                  {r.isApproved ? (
                    <button onClick={() => setApproval(r._id, false)} className="icon-btn h-8 w-8" aria-label="Hide"><X className="h-4 w-4" /></button>
                  ) : (
                    <button onClick={() => setApproval(r._id, true)} className="icon-btn h-8 w-8 text-green-700" aria-label="Approve"><Check className="h-4 w-4" /></button>
                  )}
                  <button onClick={() => setConfirmId(r._id)} className="icon-btn h-8 w-8 text-clay hover:text-red-600" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmId !== null}
        title="Delete review?"
        confirmLabel="Delete"
        onConfirm={() => confirmId && remove(confirmId)}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
