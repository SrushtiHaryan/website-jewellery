import { API_URL } from './config';
import type {
  ApiEnvelope,
  BlogPost,
  Category,
  Collection,
  PaginationMeta,
  Product,
  Review,
} from './types';

/**
 * Server-side fetch for PUBLIC data (used by server components + metadata).
 * Revalidates periodically so pages stay fast and SEO-friendly.
 */
async function serverGet<T>(
  path: string,
  opts: { revalidate?: number } = {}
): Promise<ApiEnvelope<T>> {
  const res = await fetch(`${API_URL}${path}`, {
    next: { revalidate: opts.revalidate ?? 120 },
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    if (res.status === 404) {
      return { success: false, data: null as unknown as T };
    }
    throw new Error(`API ${path} failed: ${res.status}`);
  }
  return res.json();
}

export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  subcategory?: string;
  collection?: string;
  material?: string;
  metalType?: string;
  stoneType?: string;
  occasion?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  featured?: boolean;
  newArrival?: boolean;
  sort?: string;
}

export function buildProductQuery(q: ProductQuery): string {
  const params = new URLSearchParams();
  Object.entries(q).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== null) {
      params.set(key, String(value));
    }
  });
  const str = params.toString();
  return str ? `?${str}` : '';
}

export async function getProducts(
  q: ProductQuery = {}
): Promise<{ products: Product[]; meta?: PaginationMeta }> {
  const res = await serverGet<Product[]>(`/products${buildProductQuery(q)}`);
  return { products: res.data ?? [], meta: res.meta };
}

export async function getProduct(slug: string): Promise<Product | null> {
  const res = await serverGet<Product>(`/products/${slug}`, { revalidate: 60 });
  return res.success ? res.data : null;
}

export async function getRelatedProducts(slug: string): Promise<Product[]> {
  const res = await serverGet<Product[]>(`/products/${slug}/related`);
  return res.data ?? [];
}

export async function getProductReviews(slug: string): Promise<Review[]> {
  const res = await serverGet<Review[]>(`/reviews/product/${slug}`, { revalidate: 60 });
  return res.data ?? [];
}

export async function getCategories(): Promise<Category[]> {
  const res = await serverGet<Category[]>('/categories', { revalidate: 300 });
  return res.data ?? [];
}

export async function getCategory(slug: string): Promise<Category | null> {
  const res = await serverGet<Category>(`/categories/${slug}`, { revalidate: 300 });
  return res.success ? res.data : null;
}

export async function getCollections(): Promise<Collection[]> {
  const res = await serverGet<Collection[]>('/collections', { revalidate: 300 });
  return res.data ?? [];
}

export async function getCollection(slug: string): Promise<Collection | null> {
  const res = await serverGet<Collection>(`/collections/${slug}`, { revalidate: 300 });
  return res.success ? res.data : null;
}

export async function getBlogPosts(
  q: { page?: number; limit?: number } = {}
): Promise<{ posts: BlogPost[]; meta?: PaginationMeta }> {
  const res = await serverGet<BlogPost[]>(
    `/blog${buildProductQuery(q as ProductQuery)}`,
    { revalidate: 300 }
  );
  return { posts: res.data ?? [], meta: res.meta };
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const res = await serverGet<BlogPost>(`/blog/${slug}`, { revalidate: 300 });
  return res.success ? res.data : null;
}
