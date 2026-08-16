'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SlidersHorizontal, X, Check } from 'lucide-react';
import type { Category, PaginationMeta, Product } from '@/lib/types';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';
import {
  SORT_OPTIONS,
  MATERIALS,
  METAL_TYPES,
  STONE_TYPES,
  OCCASIONS,
  PRICE_RANGES,
} from './facets';

export interface BrowserParams {
  page?: number;
  sort?: string;
  category?: string;
  material?: string;
  metalType?: string;
  stoneType?: string;
  occasion?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  [key: string]: string | number | undefined;
}

export function ProductBrowser({
  products,
  meta,
  categories,
  current,
  basePath,
  hideCategoryFilter = false,
}: {
  products: Product[];
  meta?: PaginationMeta;
  categories: Category[];
  current: BrowserParams;
  basePath: string;
  hideCategoryFilter?: boolean;
}) {
  const router = useRouter();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const navigate = (updates: BrowserParams) => {
    const next: BrowserParams = { ...current, ...updates };
    // Reset to page 1 whenever a filter (not the page itself) changes.
    if (!('page' in updates)) delete next.page;
    const params = new URLSearchParams();
    Object.entries(next).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) params.set(k, String(v));
    });
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  };

  const activeFilterCount = [
    current.material,
    current.metalType,
    current.stoneType,
    current.occasion,
    current.minPrice !== undefined ? 'price' : undefined,
    !hideCategoryFilter ? current.category : undefined,
  ].filter(Boolean).length;

  const clearAll = () => {
    const keep: BrowserParams = {};
    if (current.search) keep.search = current.search;
    if (current.sort) keep.sort = current.sort;
    const params = new URLSearchParams();
    Object.entries(keep).forEach(([k, v]) => v && params.set(k, String(v)));
    router.push(params.toString() ? `${basePath}?${params.toString()}` : basePath);
  };

  const topCategories = categories.filter((c) => !c.parent);

  const Filters = (
    <div className="space-y-7">
      {!hideCategoryFilter && (
        <FilterGroup title="Category">
          {topCategories.map((c) => (
            <FilterOption
              key={c._id}
              label={c.name}
              active={current.category === c.slug}
              onClick={() =>
                navigate({ category: current.category === c.slug ? undefined : c.slug })
              }
            />
          ))}
        </FilterGroup>
      )}

      <FilterGroup title="Price">
        {PRICE_RANGES.map((r) => {
          const active = current.minPrice === r.min && current.maxPrice === r.max;
          return (
            <FilterOption
              key={r.label}
              label={r.label}
              active={active}
              onClick={() =>
                navigate(
                  active
                    ? { minPrice: undefined, maxPrice: undefined }
                    : { minPrice: r.min, maxPrice: r.max }
                )
              }
            />
          );
        })}
      </FilterGroup>

      <FilterGroup title="Material">
        {MATERIALS.map((m) => (
          <FilterOption
            key={m}
            label={m}
            active={current.material === m}
            onClick={() => navigate({ material: current.material === m ? undefined : m })}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Metal">
        {METAL_TYPES.map((m) => (
          <FilterOption
            key={m}
            label={m}
            active={current.metalType === m}
            onClick={() => navigate({ metalType: current.metalType === m ? undefined : m })}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Stone">
        {STONE_TYPES.map((m) => (
          <FilterOption
            key={m}
            label={m}
            active={current.stoneType === m}
            onClick={() => navigate({ stoneType: current.stoneType === m ? undefined : m })}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Occasion">
        {OCCASIONS.map((m) => (
          <FilterOption
            key={m}
            label={m}
            active={current.occasion === m}
            onClick={() => navigate({ occasion: current.occasion === m ? undefined : m })}
          />
        ))}
      </FilterGroup>
    </div>
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
      {/* Desktop filters */}
      <aside className="hidden lg:block">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl text-cocoa">Filters</h3>
          {activeFilterCount > 0 && (
            <button onClick={clearAll} className="text-xs text-gold hover:underline">
              Clear all
            </button>
          )}
        </div>
        <div className="mt-6">{Filters}</div>
      </aside>

      <div>
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 border-b border-champagne/60 pb-4">
          <p className="text-sm text-clay">
            {meta ? `${meta.total} ${meta.total === 1 ? 'piece' : 'pieces'}` : `${products.length} pieces`}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFiltersOpen(true)}
              className="btn-outline px-4 py-2 text-xs lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </button>
            <label className="sr-only" htmlFor="sort">Sort by</label>
            <select
              id="sort"
              value={current.sort ?? 'featured'}
              onChange={(e) => navigate({ sort: e.target.value })}
              className="input w-auto py-2 text-sm"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {products.length === 0 ? (
          <EmptyState
            title="No pieces found"
            description="Try adjusting your filters or search to discover more."
            actionLabel="Clear filters"
            onAction={clearAll}
          />
        ) : (
          <>
            <div className="mt-8">
              <ProductGrid products={products} />
            </div>
            {meta && meta.totalPages > 1 && (
              <div className="mt-14">
                <Pagination
                  page={meta.page}
                  totalPages={meta.totalPages}
                  onPage={(p) => navigate({ page: p })}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setFiltersOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm overflow-y-auto bg-ivory p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-serif text-xl text-cocoa">Filters</h3>
              <button onClick={() => setFiltersOpen(false)} className="btn-ghost" aria-label="Close filters">
                <X className="h-5 w-5" />
              </button>
            </div>
            {Filters}
            <div className="mt-8 flex gap-3">
              <button onClick={clearAll} className="btn-outline flex-1">
                Clear all
              </button>
              <button onClick={() => setFiltersOpen(false)} className="btn-primary flex-1">
                Show results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-cocoa">{title}</h4>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function FilterOption({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition',
        active ? 'bg-cream font-medium text-cocoa' : 'text-clay hover:bg-cream/60 hover:text-cocoa'
      )}
    >
      <span
        className={cn(
          'flex h-4 w-4 items-center justify-center rounded border',
          active ? 'border-gold bg-gold text-ivory' : 'border-champagne'
        )}
      >
        {active && <Check className="h-3 w-3" />}
      </span>
      {label}
    </button>
  );
}
