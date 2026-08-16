import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CategoryView } from '@/components/category/CategoryView';
import { ProductDetail } from '@/components/product/ProductDetail';
import {
  getCategory,
  getProduct,
  getRelatedProducts,
  getProductReviews,
} from '@/lib/api-server';
import type { RawSearchParams } from '@/lib/params';
import { SITE_NAME } from '@/lib/config';

/**
 * The spec puts both categories and products under /jewellery/{slug}.
 * We resolve a category first, then fall back to a product. Slugs do not
 * collide in practice (e.g. "necklaces" vs "kundan-bridal-necklace").
 */
async function resolve(slug: string) {
  const category = await getCategory(slug);
  if (category) return { type: 'category' as const, category };
  const product = await getProduct(slug);
  if (product) return { type: 'product' as const, product };
  return { type: 'none' as const };
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const resolved = await resolve(params.slug);

  if (resolved.type === 'category') {
    const c = resolved.category;
    // A provided seoTitle is treated as the full title (absolute); otherwise the
    // layout's "%s | Aurelia" template applies.
    return {
      title: c.seoTitle ? { absolute: c.seoTitle } : `${c.name} for Women`,
      description:
        c.seoDescription ||
        `Shop handcrafted ${c.name.toLowerCase()} at ${SITE_NAME} — premium Indian jewellery.`,
      alternates: { canonical: `/jewellery/${c.slug}` },
    };
  }

  if (resolved.type === 'product') {
    const p = resolved.product;
    const title = p.seoTitle || `${p.name} | ${SITE_NAME}`;
    const description =
      p.seoDescription || p.shortDescription || p.description.slice(0, 160);
    const image = p.images.find((i) => i.isPrimary)?.url ?? p.images[0]?.url;
    return {
      title: { absolute: title },
      description,
      alternates: { canonical: `/jewellery/${p.slug}` },
      openGraph: {
        title: `${title} | ${SITE_NAME}`,
        description,
        type: 'website',
        images: image ? [{ url: image, alt: p.name }] : undefined,
      },
    };
  }

  return { title: 'Not found' };
}

export default async function JewelleryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: RawSearchParams;
}) {
  const resolved = await resolve(params.slug);

  if (resolved.type === 'category') {
    return <CategoryView category={resolved.category} searchParams={searchParams} />;
  }

  if (resolved.type === 'product') {
    const [related, reviews] = await Promise.all([
      getRelatedProducts(resolved.product.slug),
      getProductReviews(resolved.product.slug),
    ]);
    return <ProductDetail product={resolved.product} related={related} reviews={reviews} />;
  }

  notFound();
}
