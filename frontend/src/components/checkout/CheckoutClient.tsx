'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Loader2, MapPin, Plus, Truck, CreditCard, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import type { Address, CartView, Order } from '@/lib/types';
import { apiFetch, ApiError } from '@/lib/api-client';
import { useCartStore } from '@/store/cart';
import { AddressForm, type AddressInput } from '@/components/account/AddressForm';
import { OrderSummary } from '@/components/cart/OrderSummary';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatINR, cn } from '@/lib/utils';

type Step = 1 | 2 | 3;
type PaymentMethod = 'cod' | 'mock';

const STEPS = ['Address', 'Review', 'Payment'];

export function CheckoutClient() {
  const router = useRouter();
  const cartStore = useCartStore();
  const [cart, setCart] = useState<CartView | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [step, setStep] = useState<Step>(1);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [payment, setPayment] = useState<PaymentMethod>('mock');
  const [placing, setPlacing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [c, a] = await Promise.all([
          apiFetch<CartView>('/cart'),
          apiFetch<Address[]>('/users/me/addresses'),
        ]);
        setCart(c);
        setAddresses(a);
        setSelectedAddress(a.find((x) => x.isDefault)?._id ?? a[0]?._id ?? null);
        if (a.length === 0) setShowAddrForm(true);
      } catch {
        toast.error('Could not load checkout.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const addAddress = async (values: AddressInput) => {
    try {
      const list = await apiFetch<Address[]>('/users/me/addresses', {
        method: 'POST',
        body: values,
      });
      setAddresses(list);
      setSelectedAddress(list.find((x) => x.isDefault)?._id ?? list[list.length - 1]._id);
      setShowAddrForm(false);
      toast.success('Address added');
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Could not add address.');
    }
  };

  const placeOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address.');
      setStep(1);
      return;
    }
    setPlacing(true);
    try {
      const order = await apiFetch<Order>('/orders', {
        method: 'POST',
        body: { addressId: selectedAddress, paymentMethod: payment },
      });
      await cartStore.fetch().catch(() => undefined);
      toast.success('Order placed successfully!');
      router.push(`/account/orders/${order._id}?placed=1`);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Could not place order.');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
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
          description="Add pieces to your bag before checking out."
          actionLabel="Shop the collection"
          onAction={() => router.push('/shop')}
        />
      </div>
    );
  }

  return (
    <div className="container-luxe py-12">
      <h1 className="font-serif text-4xl text-cocoa">Checkout</h1>

      {/* Stepper */}
      <div className="mt-6 flex items-center gap-2">
        {STEPS.map((label, i) => {
          const n = (i + 1) as Step;
          const done = step > n;
          const active = step === n;
          return (
            <div key={label} className="flex items-center gap-2">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm',
                  done ? 'bg-gold text-ivory' : active ? 'bg-cocoa text-ivory' : 'bg-cream text-clay'
                )}
              >
                {done ? <Check className="h-4 w-4" /> : n}
              </div>
              <span className={cn('text-sm', active ? 'font-medium text-cocoa' : 'text-clay')}>
                {label}
              </span>
              {i < STEPS.length - 1 && <div className="mx-2 h-px w-8 bg-champagne md:w-14" />}
            </div>
          );
        })}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          {/* Step 1: Address */}
          {step === 1 && (
            <section>
              <h2 className="font-serif text-2xl text-cocoa">Delivery Address</h2>
              {!showAddrForm && (
                <div className="mt-5 space-y-3">
                  {addresses.map((a) => (
                    <button
                      key={a._id}
                      onClick={() => setSelectedAddress(a._id)}
                      className={cn(
                        'flex w-full gap-3 rounded-xl border p-4 text-left transition',
                        selectedAddress === a._id
                          ? 'border-gold bg-cream/50'
                          : 'border-champagne hover:border-cocoa'
                      )}
                    >
                      <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                      <div className="text-sm">
                        <p className="font-medium text-cocoa">
                          {a.fullName} {a.label && <span className="text-clay">· {a.label}</span>}
                          {a.isDefault && (
                            <span className="ml-2 rounded-full bg-champagne px-2 py-0.5 text-[10px] uppercase tracking-wide text-cocoa">
                              Default
                            </span>
                          )}
                        </p>
                        <p className="mt-1 text-clay">
                          {a.line1}
                          {a.line2 ? `, ${a.line2}` : ''}, {a.city}, {a.state} {a.postalCode}
                        </p>
                        <p className="text-clay">{a.phone}</p>
                      </div>
                    </button>
                  ))}
                  <button onClick={() => setShowAddrForm(true)} className="btn-outline mt-2">
                    <Plus className="h-4 w-4" />
                    Add a new address
                  </button>
                </div>
              )}
              {showAddrForm && (
                <div className="mt-5 card p-6">
                  <AddressForm
                    onSubmit={addAddress}
                    onCancel={addresses.length > 0 ? () => setShowAddrForm(false) : undefined}
                    submitLabel="Save & use this address"
                  />
                </div>
              )}
              <button
                onClick={() => setStep(2)}
                disabled={!selectedAddress}
                className="btn-primary mt-6"
              >
                Continue to review
              </button>
            </section>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <section>
              <h2 className="font-serif text-2xl text-cocoa">Review Your Order</h2>
              <div className="mt-5 divide-y divide-champagne/60">
                {cart.items.map((item) => (
                  <div key={item._id} className="flex gap-4 py-4">
                    <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-cream">
                      {item.product.image && (
                        <Image src={item.product.image} alt={item.product.name} fill sizes="64px" className="object-cover" />
                      )}
                    </div>
                    <div className="flex flex-1 justify-between">
                      <div className="text-sm">
                        <p className="font-medium text-cocoa">{item.product.name}</p>
                        {item.size && <p className="text-clay">Size: {item.size}</p>}
                        <p className="text-clay">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-cocoa">{formatINR(item.lineTotal)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={() => setStep(1)} className="btn-ghost">Back</button>
                <button onClick={() => setStep(3)} className="btn-primary">Continue to payment</button>
              </div>
            </section>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <section>
              <h2 className="font-serif text-2xl text-cocoa">Payment</h2>
              <div className="mt-5 space-y-3">
                <PaymentOption
                  active={payment === 'mock'}
                  onClick={() => setPayment('mock')}
                  icon={<CreditCard className="h-5 w-5" />}
                  title="Pay Online (Test)"
                  subtitle="Development mock payment — completes instantly. Razorpay-ready."
                />
                <PaymentOption
                  active={payment === 'cod'}
                  onClick={() => setPayment('cod')}
                  icon={<Truck className="h-5 w-5" />}
                  title="Cash on Delivery"
                  subtitle="Pay in cash when your order is delivered."
                />
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-cream/60 p-3 text-xs text-clay">
                <ShieldCheck className="h-4 w-4 text-gold" />
                Payments are verified securely on our servers. We never store card details.
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={() => setStep(2)} className="btn-ghost">Back</button>
                <button onClick={placeOrder} disabled={placing} className="btn-gold">
                  {placing && <Loader2 className="h-4 w-4 animate-spin" />}
                  Place Order · {formatINR(cart.pricing.total)}
                </button>
              </div>
            </section>
          )}
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <OrderSummary pricing={cart.pricing} />
        </div>
      </div>
    </div>
  );
}

function PaymentOption({
  active,
  onClick,
  icon,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-start gap-3 rounded-xl border p-4 text-left transition',
        active ? 'border-gold bg-cream/50' : 'border-champagne hover:border-cocoa'
      )}
    >
      <span className="mt-0.5 text-gold">{icon}</span>
      <span>
        <span className="block font-medium text-cocoa">{title}</span>
        <span className="block text-sm text-clay">{subtitle}</span>
      </span>
      <span
        className={cn(
          'ml-auto mt-1 flex h-5 w-5 items-center justify-center rounded-full border',
          active ? 'border-gold bg-gold text-ivory' : 'border-champagne'
        )}
      >
        {active && <Check className="h-3 w-3" />}
      </span>
    </button>
  );
}
