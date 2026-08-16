import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StarRating({
  rating,
  count,
  size = 'sm',
  showCount = true,
}: {
  rating: number;
  count?: number;
  size?: 'sm' | 'md';
  showCount?: boolean;
}) {
  const px = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex" aria-label={`Rated ${rating} out of 5`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              px,
              i <= Math.round(rating) ? 'fill-gold text-gold' : 'fill-transparent text-champagne'
            )}
          />
        ))}
      </div>
      {showCount && (
        <span className="text-xs text-clay">
          {count !== undefined ? (count > 0 ? `(${count})` : 'No reviews yet') : rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
