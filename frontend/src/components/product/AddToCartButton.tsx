'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';
import { ApiError } from '@/lib/api-client';
import { cn } from '@/lib/utils';

export function AddToCartButton({
  productId,
  productName,
  quantity = 1,
  size,
  disabled,
  label = 'Add to Cart',
  variant = 'primary',
  className,
  onAdded,
}: {
  productId: string;
  productName?: string;
  quantity?: number;
  size?: string;
  disabled?: boolean;
  label?: string;
  variant?: 'primary' | 'gold' | 'outline';
  className?: string;
  onAdded?: () => void;
}) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const add = useCartStore((s) => s.add);
  const [loading, setLoading] = useState(false);

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push(`/login?redirect=/cart`);
      return;
    }
    setLoading(true);
    try {
      await add(productId, quantity, size);
      toast.success(productName ? `${productName} added to your bag` : 'Added to your bag');
      onAdded?.();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not add to cart.');
    } finally {
      setLoading(false);
    }
  };

  const variantClass =
    variant === 'gold' ? 'btn-gold' : variant === 'outline' ? 'btn-outline' : 'btn-primary';

  return (
    <button onClick={onClick} disabled={disabled || loading} className={cn(variantClass, className)}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
      {label}
    </button>
  );
}
