import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { getBlogPosts } from '@/lib/api-server';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'The Aurelia Journal',
  description:
    'Guides, care tips and inspiration from the world of fine Indian jewellery — from choosing Kundan to styling for weddings.',
  alternates: { canonical: '/blog' },
};

export default async function BlogPage() {
  const { posts } = await getBlogPosts({ limit: 24 });

  return (
    <>
      <PageHeader
        eyebrow="The Journal"
        title="Stories & Style"
        description="Guides, care tips and inspiration from the world of fine Indian jewellery."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Journal', href: '/blog' },
        ]}
      />
      <div className="container-luxe py-12">
        {posts.length === 0 ? (
          <EmptyState title="No articles yet" description="Check back soon for new stories." />
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link key={post._id} href={`/blog/${post.slug}`} className="group">
                <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-cream">
                  {post.featuredImage?.url && (
                    <Image
                      src={post.featuredImage.url}
                      alt={post.featuredImage.alt ?? post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                  )}
                </div>
                {post.category && <p className="mt-4 eyebrow">{post.category}</p>}
                <h2 className="mt-2 font-serif text-2xl leading-snug text-cocoa transition group-hover:text-gold">
                  {post.title}
                </h2>
                {post.excerpt && <p className="mt-2 text-sm leading-relaxed text-clay">{post.excerpt}</p>}
                <p className="mt-3 text-xs text-clay">
                  {post.publishedAt ? formatDate(post.publishedAt) : ''}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
