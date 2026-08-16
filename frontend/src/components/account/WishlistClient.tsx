'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, Trash2, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { useWishlistStore } from '@/store/wishlist';
import { useCartStore } from '@/store/cart';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatINR } from '@/lib/utils';
import { ApiError } from '@/lib/api-client';

export function WishlistClient() {
  const { products, fetch, remove, moveToCart } = useWishlistStore();
  const refreshCart = useCartStore((s) => s.fetch);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    fetch()
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [fetch]);

  const move = async (id: string) => {
    setBusy(id);
    try {
      await moveToCart(id);
      await refreshCart().catch(() => undefined);
      toast.success('Moved to bag');
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Could not move to bag.');
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl text-cocoa">My Wishlist</h1>
      {products.length === 0 ? (
        <EmptyState
          title="Your wishlist is empty"
          description="Save pieces you love to find them here later."
          actionLabel="Discover jewellery"
          onAction={() => (window.location.href = '/shop')}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((p) => {
            const img = p.images?.find((i) => i.isPrimary) ?? p.images?.[0];
            return (
              <div key={p._id} className="card overflow-hidden">
                <Link href={`/jewellery/${p.slug}`} className="relative block aspect-[4/5] bg-cream">
                  {img && <Image src={img.url} alt={img.alt} fill sizes="33vw" className="object-cover" />}
                </Link>
                <div className="p-4">
                  <Link href={`/jewellery/${p.slug}`} className="font-serif text-lg text-cocoa hover:text-gold">
                    {p.name}
                  </Link>
                  <p className="mt-1 text-cocoa">{formatINR(p.finalPrice)}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => move(p._id)}
                      disabled={busy === p._id || !p.inStock}
                      className="btn-primary flex-1 py-2 text-xs"
                    >
                      {busy === p._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ShoppingBag className="h-4 w-4" />
                      )}
                      {p.inStock ? 'Move to Bag' : 'Sold Out'}
                    </button>
                    <button
                      onClick={() => remove(p._id)}
                      className="btn-outline aspect-square !px-0"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
