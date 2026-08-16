'use client';

import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth';
import { useWishlistStore } from '@/store/wishlist';
import { cn } from '@/lib/utils';

export function WishlistButton({
  productId,
  className,
}: {
  productId: string;
  className?: string;
}) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const active = useWishlistStore((s) => s.ids.has(productId));
  const toggle = useWishlistStore((s) => s.toggle);

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push('/login?redirect=/shop');
      return;
    }
    try {
      const added = await toggle(productId);
      toast.success(added ? 'Added to wishlist' : 'Removed from wishlist');
    } catch {
      toast.error('Could not update wishlist.');
    }
  };

  return (
    <button
      onClick={onClick}
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={active}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-cocoa shadow-card transition hover:bg-white',
        className
      )}
    >
      <Heart className={cn('h-4 w-4', active && 'fill-gold text-gold')} />
    </button>
  );
}
