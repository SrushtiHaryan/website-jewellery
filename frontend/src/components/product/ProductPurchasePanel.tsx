'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Heart, Loader2, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@/lib/types';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';
import { ApiError } from '@/lib/api-client';
import { cn } from '@/lib/utils';

export function ProductPurchasePanel({ product }: { product: Product }) {
  const router = useRouter();
  const id = product.id ?? product._id;
  const user = useAuthStore((s) => s.user);
  const add = useCartStore((s) => s.add);
  const wishlisted = useWishlistStore((s) => s.ids.has(id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);

  const [size, setSize] = useState<string | undefined>(product.sizes?.[0]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [buying, setBuying] = useState(false);

  const requireSize = product.sizes && product.sizes.length > 0;
  const maxQty = Math.min(product.stock, 10);

  const doAdd = async (): Promise<boolean> => {
    if (!user) {
      router.push(`/login?redirect=/jewellery/${product.slug}`);
      return false;
    }
    if (requireSize && !size) {
      toast.error('Please select a size.');
      return false;
    }
    await add(id, qty, size);
    return true;
  };

  const onAddToCart = async () => {
    setLoading(true);
    try {
      if (await doAdd()) toast.success(`${product.name} added to your bag`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not add to cart.');
    } finally {
      setLoading(false);
    }
  };

  const onBuyNow = async () => {
    setBuying(true);
    try {
      if (await doAdd()) router.push('/checkout');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not proceed.');
    } finally {
      setBuying(false);
    }
  };

  const onWishlist = async () => {
    if (!user) {
      router.push(`/login?redirect=/jewellery/${product.slug}`);
      return;
    }
    try {
      const added = await toggleWishlist(id);
      toast.success(added ? 'Added to wishlist' : 'Removed from wishlist');
    } catch {
      toast.error('Could not update wishlist.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Sizes */}
      {requireSize && (
        <div>
          <p className="label">Size</p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={cn(
                  'min-w-12 rounded-lg border px-4 py-2 text-sm transition',
                  size === s
                    ? 'border-cocoa bg-cocoa text-ivory'
                    : 'border-champagne text-cocoa hover:border-cocoa'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div>
        <p className="label">Quantity</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center rounded-full border border-champagne">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1}
              className="icon-btn h-9 w-9 disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-10 text-center text-sm font-medium">{qty}</span>
            <button
              onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
              disabled={qty >= maxQty}
              className="icon-btn h-9 w-9 disabled:opacity-40"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {product.inStock ? (
            product.stock <= 5 && (
              <span className="text-sm text-gold">Only {product.stock} left</span>
            )
          ) : (
            <span className="text-sm text-clay">Out of stock</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <button
            onClick={onAddToCart}
            disabled={!product.inStock || loading}
            className="btn-primary flex-1"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
            Add to Cart
          </button>
          <button
            onClick={onWishlist}
            className={cn(
              'btn-outline aspect-square !px-0',
              wishlisted && 'border-gold text-gold'
            )}
            aria-label="Add to wishlist"
          >
            <Heart className={cn('h-5 w-5', wishlisted && 'fill-gold')} />
          </button>
        </div>
        <button
          onClick={onBuyNow}
          disabled={!product.inStock || buying}
          className="btn-gold w-full"
        >
          {buying ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Buy Now
        </button>
      </div>
    </div>
  );
}
