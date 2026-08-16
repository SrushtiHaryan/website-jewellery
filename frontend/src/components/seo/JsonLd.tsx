import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/config';
import type { Product, Review } from '@/lib/types';

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON-LD is trusted, server-generated structured data.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        logo: `${SITE_URL}/logo.png`,
        sameAs: [
          'https://instagram.com/aurelia',
          'https://facebook.com/aurelia',
          'https://pinterest.com/aurelia',
        ],
      }}
    />
  );
}

export function WebSiteJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}/shop?search={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: `${SITE_URL}${item.url}`,
        })),
      }}
    />
  );
}

export function ProductJsonLd({
  product,
  reviews,
}: {
  product: Product;
  reviews?: Review[];
}) {
  const image = product.images?.map((i) => i.url) ?? [];
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.seoDescription || product.shortDescription || product.description,
    image,
    sku: product.sku,
    brand: { '@type': 'Brand', name: SITE_NAME },
    ...(product.material ? { material: product.material } : {}),
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/jewellery/${product.slug}`,
      priceCurrency: 'INR',
      price: product.finalPrice,
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };

  // Only include ratings/reviews when they genuinely exist — never fabricate.
  if (product.reviewCount > 0 && product.averageRating > 0) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.averageRating,
      reviewCount: product.reviewCount,
    };
  }
  if (reviews && reviews.length > 0) {
    data.review = reviews.slice(0, 5).map((r) => ({
      '@type': 'Review',
      reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 },
      author: {
        '@type': 'Person',
        name: typeof r.user === 'object' ? r.user.name : 'Verified Buyer',
      },
      reviewBody: r.comment,
    }));
  }

  return <JsonLd data={data} />;
}
