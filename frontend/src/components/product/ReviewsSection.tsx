'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import type { Review } from '@/lib/types';
import { StarRating } from './StarRating';
import { useAuthStore } from '@/store/auth';
import { apiFetch, ApiError } from '@/lib/api-client';
import { formatDate, cn } from '@/lib/utils';

export function ReviewsSection({
  productId,
  slug,
  averageRating,
  reviewCount,
  initialReviews,
}: {
  productId: string;
  slug: string;
  averageRating: number;
  reviewCount: number;
  initialReviews: Review[];
}) {
  const user = useAuthStore((s) => s.user);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim().length < 3) {
      toast.error('Please write a short comment.');
      return;
    }
    setSubmitting(true);
    try {
      const review = await apiFetch<Review>('/reviews', {
        method: 'POST',
        body: { productId, rating, title, comment },
      });
      setReviews((r) => [{ ...review, user: { _id: user!._id, name: user!.name } }, ...r]);
      setShowForm(false);
      setTitle('');
      setComment('');
      toast.success('Thank you for your review!');
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Could not submit review.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="border-t border-champagne/60 py-16">
      <div className="grid gap-10 md:grid-cols-[280px_1fr]">
        {/* Summary */}
        <div>
          <h2 className="font-serif text-3xl text-cocoa">Reviews</h2>
          <div className="mt-4 flex items-center gap-3">
            <span className="font-serif text-4xl text-cocoa">{averageRating.toFixed(1)}</span>
            <div>
              <StarRating rating={averageRating} showCount={false} size="md" />
              <p className="mt-1 text-xs text-clay">
                {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
              </p>
            </div>
          </div>
          {user ? (
            <button onClick={() => setShowForm((s) => !s)} className="btn-outline mt-6 w-full">
              {showForm ? 'Cancel' : 'Write a review'}
            </button>
          ) : (
            <p className="mt-6 text-sm text-clay">
              <a href={`/login?redirect=/jewellery/${slug}`} className="text-gold hover:underline">
                Sign in
              </a>{' '}
              to write a review. Only verified purchasers can review.
            </p>
          )}
        </div>

        {/* List + form */}
        <div>
          {showForm && (
            <form onSubmit={submit} className="card mb-8 space-y-4 p-6">
              <div>
                <p className="label">Your rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRating(i)}
                      onMouseEnter={() => setHover(i)}
                      onMouseLeave={() => setHover(0)}
                      aria-label={`${i} star`}
                    >
                      <Star
                        className={cn(
                          'h-7 w-7 transition',
                          i <= (hover || rating) ? 'fill-gold text-gold' : 'text-champagne'
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label" htmlFor="review-title">Title (optional)</label>
                <input
                  id="review-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input"
                  placeholder="Sum up your experience"
                />
              </div>
              <div>
                <label className="label" htmlFor="review-comment">Your review</label>
                <textarea
                  id="review-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="input min-h-28"
                  placeholder="What did you love about this piece?"
                />
              </div>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit review'}
              </button>
            </form>
          )}

          {reviews.length === 0 ? (
            <p className="text-sm text-clay">No reviews yet. Be the first to review this piece.</p>
          ) : (
            <div className="space-y-6">
              {reviews.map((r) => (
                <div key={r._id} className="border-b border-champagne/50 pb-6 last:border-0">
                  <div className="flex items-center justify-between">
                    <StarRating rating={r.rating} showCount={false} />
                    <span className="text-xs text-clay">{formatDate(r.createdAt)}</span>
                  </div>
                  {r.title && <p className="mt-2 font-medium text-cocoa">{r.title}</p>}
                  <p className="mt-1.5 text-sm leading-relaxed text-clay">{r.comment}</p>
                  <p className="mt-2 text-xs text-clay">
                    — {typeof r.user === 'object' ? r.user.name : 'Verified Buyer'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
