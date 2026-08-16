import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getBlogPost } from '@/lib/api-server';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { SITE_NAME } from '@/lib/config';
import { formatDate } from '@/lib/utils';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getBlogPost(params.slug);
  if (!post) return { title: 'Article not found' };
  return {
    title: post.seoTitle ? { absolute: post.seoTitle } : post.title,
    description: post.seoDescription || post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: `${post.title} | ${SITE_NAME}`,
      description: post.excerpt,
      type: 'article',
      images: post.featuredImage?.url ? [{ url: post.featuredImage.url }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug);
  if (!post) notFound();

  const authorName = typeof post.author === 'object' ? post.author.name : 'Aurelia';

  return (
    <article className="container-luxe max-w-3xl py-12">
      <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-clay hover:text-gold">
        <ArrowLeft className="h-4 w-4" />
        Back to Journal
      </Link>

      {post.category && <p className="mt-6 eyebrow">{post.category}</p>}
      <h1 className="mt-2 font-serif text-4xl leading-tight text-cocoa md:text-5xl">{post.title}</h1>
      <p className="mt-3 text-sm text-clay">
        By {authorName}
        {post.publishedAt && <> · {formatDate(post.publishedAt)}</>}
      </p>

      {post.featuredImage?.url && (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl bg-cream">
          <Image
            src={post.featuredImage.url}
            alt={post.featuredImage.alt ?? post.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>
      )}

      <div className="prose mt-10 max-w-none space-y-5 text-[17px] leading-relaxed text-clay">
        {post.content.split('\n').filter(Boolean).map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Journal', url: '/blog' },
          { name: post.title, url: `/blog/${post.slug}` },
        ]}
      />
    </article>
  );
}
