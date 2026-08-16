import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import { StarRating } from './StarRating';
import { WishlistButton } from './WishlistButton';
import { AddToCartButton } from './AddToCartButton';

export function ProductCard({ product }: { product: Product }) {
  const id = product.id ?? product._id;
  const primary = product.images.find((i) => i.isPrimary) ?? product.images[0];
  const secondary = product.images[1];
  const hasDiscount = product.discountPercent > 0;

  return (
    <div className="group relative flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-cream">
        <Link href={`/jewellery/${product.slug}`} aria-label={product.name}>
          {primary && (
            <Image
              src={primary.url}
              alt={primary.alt}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover transition-all duration-700 group-hover:scale-105"
            />
          )}
          {secondary && (
            <Image
              src={secondary.url}
              alt={secondary.alt}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            />
          )}
        </Link>

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.isNewArrival && (
            <span className="rounded-full bg-cocoa px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-ivory">
              New
            </span>
          )}
          {hasDiscount && (
            <span className="rounded-full bg-gold px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-ivory">
              {product.discountPercent}% Off
            </span>
          )}
          {!product.inStock && (
            <span className="rounded-full bg-clay px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-ivory">
              Sold Out
            </span>
          )}
        </div>

        <WishlistButton productId={id} className="absolute right-3 top-3" />

        {/* Quick add on hover (desktop) */}
        <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          {product.inStock ? (
            <AddToCartButton
              productId={id}
              productName={product.name}
              label="Add to Bag"
              variant="primary"
              className="w-full py-2.5"
            />
          ) : (
            <Link href={`/jewellery/${product.slug}`} className="btn-outline w-full bg-white/90 py-2.5">
              View Details
            </Link>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="mt-3 flex flex-1 flex-col">
        <p className="text-[11px] uppercase tracking-wider text-clay">{product.category?.name}</p>
        <Link
          href={`/jewellery/${product.slug}`}
          className="mt-1 line-clamp-2 font-serif text-lg leading-snug text-cocoa transition hover:text-gold"
        >
          {product.name}
        </Link>
        <div className="mt-1.5">
          <StarRating rating={product.averageRating} count={product.reviewCount} />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-medium text-cocoa">{formatINR(product.finalPrice)}</span>
          {hasDiscount && (
            <span className="text-sm text-clay line-through">{formatINR(product.price)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
