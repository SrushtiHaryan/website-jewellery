'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, Loader2, AlertTriangle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';
import { OrderSummary } from './OrderSummary';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatINR } from '@/lib/utils';

const ISSUE_TEXT: Record<string, string> = {
  out_of_stock: 'Out of stock',
  insufficient_stock: 'Not enough in stock',
  unavailable: 'No longer available',
};

export function CartClient() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);
  const { cart, loading, fetch, update, remove } = useCartStore();
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && user) fetch().catch(() => undefined);
  }, [hydrated, user, fetch]);

  if (hydrated && !user) {
    return (
      <div className="container-luxe py-16">
        <EmptyState
          title="Your bag awaits"
          description="Sign in to view your bag and continue shopping."
          actionLabel="Sign in"
          onAction={() => (window.location.href = '/login?redirect=/cart')}
        />
      </div>
    );
  }

  if (!hydrated || (loading && !cart)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container-luxe py-16">
        <EmptyState
          title="Your bag is empty"
          description="Discover our handcrafted pieces and add your favourites."
          actionLabel="Shop the collection"
          onAction={() => (window.location.href = '/shop')}
        />
      </div>
    );
  }

  const changeQty = async (itemId: string, qty: number) => {
    setBusyId(itemId);
    try {
      await update(itemId, qty);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not update quantity.');
    } finally {
      setBusyId(null);
    }
  };

  const removeItem = async (itemId: string) => {
    setBusyId(itemId);
    try {
      await remove(itemId);
      toast.success('Removed from bag');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="container-luxe py-12">
      <h1 className="font-serif text-4xl text-cocoa">Your Bag</h1>
      <p className="mt-1 text-sm text-clay">
        {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        {/* Items */}
        <div className="divide-y divide-champagne/60">
          {cart.items.map((item) => (
            <div key={item._id} className="flex gap-4 py-6">
              <Link
                href={`/jewellery/${item.product.slug}`}
                className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-cream"
              >
                {item.product.image && (
                  <Image src={item.product.image} alt={item.product.name} fill sizes="96px" className="object-cover" />
                )}
              </Link>

              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-4">
                  <div>
                    <Link
                      href={`/jewellery/${item.product.slug}`}
                      className="font-serif text-lg text-cocoa hover:text-gold"
                    >
                      {item.product.name}
                    </Link>
                    {item.size && <p className="text-xs text-clay">Size: {item.size}</p>}
                    <p className="mt-1 text-sm text-cocoa">{formatINR(item.product.finalPrice)}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item._id)}
                    disabled={busyId === item._id}
                    className="icon-btn h-9 w-9 shrink-0 text-clay hover:text-cocoa"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {item.issue && (
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-red-600">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {ISSUE_TEXT[item.issue]}
                  </p>
                )}

                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-full border border-champagne">
                    <button
                      onClick={() => changeQty(item._id, item.quantity - 1)}
                      disabled={item.quantity <= 1 || busyId === item._id}
                      className="icon-btn h-8 w-8 disabled:opacity-40"
                      aria-label="Decrease"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-9 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => changeQty(item._id, item.quantity + 1)}
                      disabled={busyId === item._id || item.quantity >= item.product.stock}
                      className="icon-btn h-8 w-8 disabled:opacity-40"
                      aria-label="Increase"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="font-medium text-cocoa">{formatINR(item.lineTotal)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <OrderSummary pricing={cart.pricing}>
            <Link
              href="/checkout"
              className={`btn-primary mt-6 w-full ${cart.hasIssues ? 'pointer-events-none opacity-50' : ''}`}
            >
              Proceed to Checkout
              <ArrowRight className="h-4 w-4" />
            </Link>
            {cart.hasIssues && (
              <p className="mt-2 text-center text-xs text-red-600">
                Please resolve the flagged items before checkout.
              </p>
            )}
            <Link href="/shop" className="mt-3 block text-center text-sm text-gold hover:underline">
              Continue shopping
            </Link>
          </OrderSummary>
        </div>
      </div>
    </div>
  );
}
