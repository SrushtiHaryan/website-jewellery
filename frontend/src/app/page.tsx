import { Hero } from '@/components/home/Hero';
import { FeaturedCategories } from '@/components/home/FeaturedCategories';
import { CollectionShowcase } from '@/components/home/CollectionShowcase';
import { BrandStory } from '@/components/home/BrandStory';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { Testimonials } from '@/components/home/Testimonials';
import { InstagramSection } from '@/components/home/InstagramSection';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ProductGrid } from '@/components/product/ProductGrid';
import { getCategories, getCollections, getProducts } from '@/lib/api-server';

export default async function HomePage() {
  const [categories, collections, featured, newArrivals, bestSellers] = await Promise.all([
    getCategories(),
    getCollections(),
    getProducts({ featured: true, limit: 8, sort: 'featured' }),
    getProducts({ newArrival: true, limit: 4, sort: 'newest' }),
    getProducts({ limit: 4, sort: 'best-selling' }),
  ]);

  return (
    <>
      <Hero />
      <FeaturedCategories categories={categories} />

      {featured.products.length > 0 && (
        <section className="container-luxe py-8">
          <SectionHeading
            eyebrow="Handpicked for you"
            title="Featured pieces"
            href="/shop?featured=true"
          />
          <div className="mt-10">
            <ProductGrid products={featured.products} />
          </div>
        </section>
      )}

      <CollectionShowcase collections={collections} />

      {newArrivals.products.length > 0 && (
        <section className="container-luxe py-20">
          <SectionHeading eyebrow="Fresh from the atelier" title="New arrivals" href="/shop?newArrival=true" />
          <div className="mt-10">
            <ProductGrid products={newArrivals.products} />
          </div>
        </section>
      )}

      <BrandStory />
      <WhyChooseUs />

      {bestSellers.products.length > 0 && (
        <section className="container-luxe py-20">
          <SectionHeading eyebrow="Most loved" title="Best sellers" href="/shop?sort=best-selling" />
          <div className="mt-10">
            <ProductGrid products={bestSellers.products} />
          </div>
        </section>
      )}

      <Testimonials />
      <InstagramSection />
    </>
  );
}
