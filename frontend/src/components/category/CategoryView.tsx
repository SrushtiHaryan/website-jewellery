import type { Category } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProductBrowser } from '@/components/shop/ProductBrowser';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { getCategories, getProducts } from '@/lib/api-server';
import { toBrowserParams, toProductQuery, type RawSearchParams } from '@/lib/params';

export async function CategoryView({
  category,
  searchParams,
}: {
  category: Category;
  searchParams: RawSearchParams;
}) {
  // Category is fixed by the URL path; other filters come from the query string.
  const query = { ...toProductQuery(searchParams), category: category.slug };
  const [{ products, meta }, categories] = await Promise.all([
    getProducts(query),
    getCategories(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Category"
        title={category.heading || category.name}
        description={
          category.description ??
          `Explore our handcrafted ${category.name.toLowerCase()} — designed to be treasured.`
        }
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Shop', href: '/shop' },
          { label: category.name, href: `/jewellery/${category.slug}` },
        ]}
      />
      <div className="container-luxe py-12">
        <ProductBrowser
          products={products}
          meta={meta}
          categories={categories}
          current={toBrowserParams(searchParams)}
          basePath={`/jewellery/${category.slug}`}
          hideCategoryFilter
        />
      </div>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Jewellery', url: '/shop' },
          { name: category.name, url: `/jewellery/${category.slug}` },
        ]}
      />
    </>
  );
}
