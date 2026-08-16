import type { ProductQuery } from './api-server';
import type { BrowserParams } from '@/components/shop/ProductBrowser';

export type RawSearchParams = Record<string, string | string[] | undefined>;

function str(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

function num(v: string | string[] | undefined): number | undefined {
  const s = str(v);
  if (s === undefined || s === '') return undefined;
  const n = Number(s);
  return Number.isNaN(n) ? undefined : n;
}

/** Parse Next.js searchParams into a typed ProductQuery for the API. */
export function toProductQuery(sp: RawSearchParams): ProductQuery {
  return {
    page: num(sp.page) ?? 1,
    limit: num(sp.limit) ?? 24,
    search: str(sp.search),
    category: str(sp.category),
    subcategory: str(sp.subcategory),
    collection: str(sp.collection),
    material: str(sp.material),
    metalType: str(sp.metalType),
    stoneType: str(sp.stoneType),
    occasion: str(sp.occasion),
    minPrice: num(sp.minPrice),
    maxPrice: num(sp.maxPrice),
    minRating: num(sp.minRating),
    inStock: str(sp.inStock) === 'true' ? true : undefined,
    featured: str(sp.featured) === 'true' ? true : undefined,
    newArrival: str(sp.newArrival) === 'true' ? true : undefined,
    sort: str(sp.sort) ?? 'featured',
  };
}

/** Parse into the shape the client ProductBrowser expects for its controls. */
export function toBrowserParams(sp: RawSearchParams): BrowserParams {
  return {
    page: num(sp.page),
    sort: str(sp.sort),
    category: str(sp.category),
    material: str(sp.material),
    metalType: str(sp.metalType),
    stoneType: str(sp.stoneType),
    occasion: str(sp.occasion),
    minPrice: num(sp.minPrice),
    maxPrice: num(sp.maxPrice),
    search: str(sp.search),
  };
}
