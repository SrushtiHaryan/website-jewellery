import Link from 'next/link';
import { ChevronRight, Truck, ShieldCheck, RefreshCw } from 'lucide-react';
import type { Product, Review } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import { StarRating } from './StarRating';
import { ProductGallery } from './ProductGallery';
import { ProductPurchasePanel } from './ProductPurchasePanel';
import { ReviewsSection } from './ReviewsSection';
import { ProductGrid } from './ProductGrid';
import { Accordion } from '@/components/ui/Accordion';
import { ProductJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';

export function ProductDetail({
  product,
  related,
  reviews,
}: {
  product: Product;
  related: Product[];
  reviews: Review[];
}) {
  const hasDiscount = product.discountPercent > 0;

  const specs: [string, string | undefined][] = [
    ['Material', product.material],
    ['Metal', product.metalType],
    ['Stone', product.stoneType],
    ['Weight', product.weightGrams ? `${product.weightGrams} g` : undefined],
    ['Dimensions', product.dimensions],
    ['SKU', product.sku],
  ];

  return (
    <div className="container-luxe py-8 md:py-12">
      {/* Breadcrumbs */}
      <nav className="mb-8 flex flex-wrap items-center gap-1.5 text-xs text-clay" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-gold">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/shop" className="hover:text-gold">Jewellery</Link>
        <ChevronRight className="h-3 w-3" />
        {product.category && (
          <>
            <Link href={`/jewellery/${product.category.slug}`} className="hover:text-gold">
              {product.category.name}
            </Link>
            <ChevronRight className="h-3 w-3" />
          </>
        )}
        <span className="text-cocoa">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />

        <div>
          {product.category && (
            <p className="text-xs uppercase tracking-luxe text-gold">{product.category.name}</p>
          )}
          <h1 className="mt-2 font-serif text-3xl text-cocoa md:text-4xl">{product.name}</h1>

          <div className="mt-3">
            <StarRating rating={product.averageRating} count={product.reviewCount} size="md" />
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-serif text-3xl text-cocoa">{formatINR(product.finalPrice)}</span>
            {hasDiscount && (
              <>
                <span className="text-lg text-clay line-through">{formatINR(product.price)}</span>
                <span className="rounded-full bg-gold/15 px-2.5 py-1 text-xs font-medium text-gold-deep">
                  Save {product.discountPercent}%
                </span>
              </>
            )}
          </div>
          <p className="mt-1 text-xs text-clay">Inclusive of all taxes</p>

          {product.shortDescription && (
            <p className="mt-6 leading-relaxed text-clay">{product.shortDescription}</p>
          )}

          <div className="mt-8">
            <ProductPurchasePanel product={product} />
          </div>

          {/* Trust badges */}
          <div className="mt-8 grid grid-cols-3 gap-3 border-y border-champagne/60 py-5 text-center">
            <div className="flex flex-col items-center gap-1.5 text-xs text-clay">
              <Truck className="h-5 w-5 text-gold" />
              Insured shipping
            </div>
            <div className="flex flex-col items-center gap-1.5 text-xs text-clay">
              <ShieldCheck className="h-5 w-5 text-gold" />
              BIS hallmarked
            </div>
            <div className="flex flex-col items-center gap-1.5 text-xs text-clay">
              <RefreshCw className="h-5 w-5 text-gold" />
              15-day returns
            </div>
          </div>

          {/* Details accordion */}
          <div className="mt-8">
            <Accordion
              items={[
                {
                  title: 'Product Description',
                  defaultOpen: true,
                  content: <p>{product.description}</p>,
                },
                {
                  title: 'Jewellery Details',
                  content: (
                    <dl className="grid grid-cols-2 gap-x-6 gap-y-2">
                      {specs
                        .filter(([, v]) => v)
                        .map(([k, v]) => (
                          <div key={k} className="flex justify-between border-b border-champagne/40 py-1.5">
                            <dt className="text-clay">{k}</dt>
                            <dd className="font-medium text-cocoa">{v}</dd>
                          </div>
                        ))}
                    </dl>
                  ),
                },
                {
                  title: 'Material & Craftsmanship',
                  content: (
                    <p>
                      Each Aurelia piece is hand-finished by skilled artisans using traditional
                      Indian techniques. {product.material ? `Crafted in ${product.material}` : 'Crafted'} with
                      meticulous attention to detail and certified for purity.
                    </p>
                  ),
                },
                {
                  title: 'Care Instructions',
                  content: (
                    <p>
                      Store separately in a soft pouch. Avoid contact with perfume, water and
                      chemicals. Clean gently with a dry, soft cloth to maintain lustre.
                    </p>
                  ),
                },
                {
                  title: 'Shipping Information',
                  content: (
                    <p>
                      Complimentary insured shipping on orders over ₹2,000 (₹99 otherwise). Orders
                      are dispatched within 2–4 business days and typically delivered within a week.
                    </p>
                  ),
                },
                {
                  title: 'Returns & Refunds',
                  content: (
                    <p>
                      Return unworn pieces within 15 days of delivery for a full refund or exchange.
                      Custom and personalised items are non-returnable.
                    </p>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Reviews */}
      <ReviewsSection
        productId={product.id ?? product._id}
        slug={product.slug}
        averageRating={product.averageRating}
        reviewCount={product.reviewCount}
        initialReviews={reviews}
      />

      {/* Related */}
      {related.length > 0 && (
        <section className="border-t border-champagne/60 py-16">
          <h2 className="mb-10 text-center font-serif text-3xl text-cocoa">You may also love</h2>
          <ProductGrid products={related} />
        </section>
      )}

      <ProductJsonLd product={product} reviews={reviews} />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Jewellery', url: '/shop' },
          ...(product.category
            ? [{ name: product.category.name, url: `/jewellery/${product.category.slug}` }]
            : []),
          { name: product.name, url: `/jewellery/${product.slug}` },
        ]}
      />
    </div>
  );
}
