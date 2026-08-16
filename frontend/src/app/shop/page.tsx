import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProductBrowser } from '@/components/shop/ProductBrowser';
import { getCategories, getProducts } from '@/lib/api-server';
import { toBrowserParams, toProductQuery, type RawSearchParams } from '@/lib/params';

export const metadata: Metadata = {
  title: 'Shop All Jewellery',
  description:
    'Browse the complete Aurelia collection — Kundan, Polki, gold, diamond and silver jewellery. Filter by category, material, occasion and price.',
  alternates: { canonical: '/shop' },
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: RawSearchParams;
}) {
  const query = toProductQuery(searchParams);
  const [{ products, meta }, categories] = await Promise.all([
    getProducts(query),
    getCategories(),
  ]);

  const searchTerm = query.search;

  return (
    <>
      <PageHeader
        eyebrow="The Collection"
        title={searchTerm ? `Results for “${searchTerm}”` : 'All Jewellery'}
        description={
          searchTerm
            ? undefined
            : 'Explore our full collection of handcrafted Indian jewellery, from everyday elegance to bridal grandeur.'
        }
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Shop', href: '/shop' },
        ]}
      />
      <div className="container-luxe py-12">
        <ProductBrowser
          products={products}
          meta={meta}
          categories={categories}
          current={toBrowserParams(searchParams)}
          basePath="/shop"
        />
      </div>
    </>
  );
}
