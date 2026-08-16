import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProductBrowser } from '@/components/shop/ProductBrowser';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { getCategories, getCollection, getProducts } from '@/lib/api-server';
import { toBrowserParams, toProductQuery, type RawSearchParams } from '@/lib/params';
import { SITE_NAME } from '@/lib/config';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const collection = await getCollection(params.slug);
  if (!collection) return { title: 'Collection not found' };
  return {
    title: collection.seoTitle ? { absolute: collection.seoTitle } : collection.name,
    description:
      collection.seoDescription ||
      collection.description ||
      `Discover the ${collection.name} at ${SITE_NAME}.`,
    alternates: { canonical: `/collections/${collection.slug}` },
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: RawSearchParams;
}) {
  const collection = await getCollection(params.slug);
  if (!collection) notFound();

  const query = { ...toProductQuery(searchParams), collection: collection.slug };
  const [{ products, meta }, categories] = await Promise.all([
    getProducts(query),
    getCategories(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow={collection.tagline || 'Collection'}
        title={collection.name}
        description={collection.description}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Collections', href: '/shop' },
          { label: collection.name, href: `/collections/${collection.slug}` },
        ]}
      />
      <div className="container-luxe py-12">
        <ProductBrowser
          products={products}
          meta={meta}
          categories={categories}
          current={toBrowserParams(searchParams)}
          basePath={`/collections/${collection.slug}`}
        />
      </div>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/shop' },
          { name: collection.name, url: `/collections/${collection.slug}` },
        ]}
      />
    </>
  );
}
