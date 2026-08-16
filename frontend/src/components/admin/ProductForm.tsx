'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2, Plus, Trash2, ArrowLeft, Upload } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import type { Category, Collection, Product } from '@/lib/types';
import { apiFetch, ApiError, uploadImages } from '@/lib/api-client';

interface ImageRow {
  url: string;
  alt: string;
  isPrimary: boolean;
  publicId?: string;
}

interface FormState {
  name: string;
  sku: string;
  shortDescription: string;
  description: string;
  category: string;
  subcategory: string;
  collections: string[];
  price: string;
  discountPercent: string;
  stock: string;
  lowStockThreshold: string;
  material: string;
  metalType: string;
  stoneType: string;
  weightGrams: string;
  dimensions: string;
  sizes: string;
  occasion: string;
  tags: string;
  images: ImageRow[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isActive: boolean;
  seoTitle: string;
  seoDescription: string;
}

const EMPTY: FormState = {
  name: '', sku: '', shortDescription: '', description: '', category: '', subcategory: '',
  collections: [], price: '', discountPercent: '0', stock: '0', lowStockThreshold: '5',
  material: '', metalType: '', stoneType: '', weightGrams: '', dimensions: '', sizes: '',
  occasion: '', tags: '', images: [{ url: '', alt: '', isPrimary: true }],
  isFeatured: false, isNewArrival: false, isActive: true, seoTitle: '', seoDescription: '',
};

export function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(productId);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const [cats, cols] = await Promise.all([
        apiFetch<Category[]>('/admin/categories'),
        apiFetch<Collection[]>('/admin/collections'),
      ]);
      setCategories(cats);
      setCollections(cols);

      if (productId) {
        try {
          const p = await apiFetch<Product>(`/admin/products/${productId}`);
          setForm({
            name: p.name,
            sku: p.sku,
            shortDescription: p.shortDescription ?? '',
            description: p.description,
            category: typeof p.category === 'object' ? p.category._id : (p.category as string),
            subcategory: p.subcategory ? (typeof p.subcategory === 'object' ? p.subcategory._id : (p.subcategory as string)) : '',
            collections: (p.collections ?? []).map((c) => c._id),
            price: String(p.price),
            discountPercent: String(p.discountPercent),
            stock: String(p.stock),
            lowStockThreshold: String((p as unknown as { lowStockThreshold?: number }).lowStockThreshold ?? 5),
            material: p.material ?? '',
            metalType: p.metalType ?? '',
            stoneType: p.stoneType ?? '',
            weightGrams: p.weightGrams ? String(p.weightGrams) : '',
            dimensions: p.dimensions ?? '',
            sizes: (p.sizes ?? []).join(', '),
            occasion: (p.occasion ?? []).join(', '),
            tags: (p.tags ?? []).join(', '),
            images: p.images.length ? p.images.map((i) => ({ url: i.url, alt: i.alt, isPrimary: !!i.isPrimary, publicId: i.publicId })) : EMPTY.images,
            isFeatured: p.isFeatured,
            isNewArrival: p.isNewArrival,
            isActive: p.isActive,
            seoTitle: p.seoTitle ?? '',
            seoDescription: p.seoDescription ?? '',
          });
        } catch {
          toast.error('Could not load product.');
        }
      }
      setLoading(false);
    })();
  }, [productId]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const toList = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);

  const onUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    try {
      const uploaded = await uploadImages(Array.from(fileList));
      setForm((f) => {
        const existing = f.images.filter((i) => i.url); // drop the empty starter row
        const rows: ImageRow[] = uploaded.map((u, idx) => ({
          url: u.url,
          publicId: u.publicId,
          alt: f.name || 'Aurelia jewellery',
          isPrimary: existing.length === 0 && idx === 0,
        }));
        return { ...f, images: [...existing, ...rows] };
      });
      toast.success(`${uploaded.length} image${uploaded.length > 1 ? 's' : ''} uploaded`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category) {
      toast.error('Please choose a category.');
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name,
      sku: form.sku,
      shortDescription: form.shortDescription || undefined,
      description: form.description,
      category: form.category,
      subcategory: form.subcategory || undefined,
      collections: form.collections,
      price: Number(form.price),
      discountPercent: Number(form.discountPercent),
      stock: Number(form.stock),
      lowStockThreshold: Number(form.lowStockThreshold),
      material: form.material || undefined,
      metalType: form.metalType || undefined,
      stoneType: form.stoneType || undefined,
      weightGrams: form.weightGrams ? Number(form.weightGrams) : undefined,
      dimensions: form.dimensions || undefined,
      sizes: toList(form.sizes),
      occasion: toList(form.occasion),
      tags: toList(form.tags),
      images: form.images.filter((i) => i.url).map((i) => ({ url: i.url, alt: i.alt || form.name, isPrimary: i.isPrimary, publicId: i.publicId })),
      isFeatured: form.isFeatured,
      isNewArrival: form.isNewArrival,
      isActive: form.isActive,
      seoTitle: form.seoTitle || undefined,
      seoDescription: form.seoDescription || undefined,
    };
    try {
      if (isEdit) {
        await apiFetch(`/admin/products/${productId}`, { method: 'PATCH', body: payload });
        toast.success('Product updated');
      } else {
        await apiFetch('/admin/products', { method: 'POST', body: payload });
        toast.success('Product created');
      }
      router.push('/admin/products');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not save product.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  const topCategories = categories.filter((c) => !c.parent);

  return (
    <form onSubmit={submit} className="max-w-4xl space-y-8">
      <div>
        <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-sm text-clay hover:text-gold">
          <ArrowLeft className="h-4 w-4" /> Products
        </Link>
        <h1 className="mt-2 font-serif text-3xl text-cocoa">{isEdit ? 'Edit product' : 'New product'}</h1>
      </div>

      {/* Basics */}
      <Section title="Basic information">
        <Field label="Product name" className="sm:col-span-2">
          <input required value={form.name} onChange={(e) => set('name', e.target.value)} className="input" />
        </Field>
        <Field label="SKU">
          <input required value={form.sku} onChange={(e) => set('sku', e.target.value)} className="input" />
        </Field>
        <Field label="Short description" className="sm:col-span-3">
          <input value={form.shortDescription} onChange={(e) => set('shortDescription', e.target.value)} className="input" />
        </Field>
        <Field label="Full description" className="sm:col-span-3">
          <textarea required value={form.description} onChange={(e) => set('description', e.target.value)} className="input min-h-28" />
        </Field>
      </Section>

      {/* Organisation */}
      <Section title="Organisation">
        <Field label="Category">
          <select required value={form.category} onChange={(e) => set('category', e.target.value)} className="input">
            <option value="">Select category</option>
            {topCategories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Subcategory (optional)">
          <select value={form.subcategory} onChange={(e) => set('subcategory', e.target.value)} className="input">
            <option value="">None</option>
            {categories.filter((c) => c.parent).map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Collections" className="sm:col-span-3">
          <div className="flex flex-wrap gap-2">
            {collections.map((c) => {
              const active = form.collections.includes(c._id);
              return (
                <button
                  type="button"
                  key={c._id}
                  onClick={() =>
                    set(
                      'collections',
                      active ? form.collections.filter((x) => x !== c._id) : [...form.collections, c._id]
                    )
                  }
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${
                    active ? 'border-cocoa bg-cocoa text-ivory' : 'border-champagne text-cocoa hover:border-cocoa'
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </Field>
      </Section>

      {/* Pricing & stock */}
      <Section title="Pricing & inventory">
        <Field label="Price (₹)">
          <input type="number" required min={0} value={form.price} onChange={(e) => set('price', e.target.value)} className="input" />
        </Field>
        <Field label="Discount (%)">
          <input type="number" min={0} max={90} value={form.discountPercent} onChange={(e) => set('discountPercent', e.target.value)} className="input" />
        </Field>
        <Field label="Stock">
          <input type="number" min={0} value={form.stock} onChange={(e) => set('stock', e.target.value)} className="input" />
        </Field>
        <Field label="Low-stock threshold">
          <input type="number" min={0} value={form.lowStockThreshold} onChange={(e) => set('lowStockThreshold', e.target.value)} className="input" />
        </Field>
      </Section>

      {/* Attributes */}
      <Section title="Attributes">
        <Field label="Material"><input value={form.material} onChange={(e) => set('material', e.target.value)} className="input" /></Field>
        <Field label="Metal type"><input value={form.metalType} onChange={(e) => set('metalType', e.target.value)} className="input" /></Field>
        <Field label="Stone type"><input value={form.stoneType} onChange={(e) => set('stoneType', e.target.value)} className="input" /></Field>
        <Field label="Weight (g)"><input type="number" value={form.weightGrams} onChange={(e) => set('weightGrams', e.target.value)} className="input" /></Field>
        <Field label="Dimensions"><input value={form.dimensions} onChange={(e) => set('dimensions', e.target.value)} className="input" /></Field>
        <Field label="Sizes (comma separated)"><input value={form.sizes} onChange={(e) => set('sizes', e.target.value)} className="input" placeholder="12, 14, 16" /></Field>
        <Field label="Occasions (comma separated)"><input value={form.occasion} onChange={(e) => set('occasion', e.target.value)} className="input" placeholder="Bridal, Festive" /></Field>
        <Field label="Tags (comma separated)" className="sm:col-span-2"><input value={form.tags} onChange={(e) => set('tags', e.target.value)} className="input" placeholder="kundan, necklace" /></Field>
      </Section>

      {/* Images */}
      <Section title="Images">
        <div className="sm:col-span-3 space-y-3">
          {/* Upload from device (→ Cloudinary) */}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => onUpload(e.target.files)}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-champagne bg-cream/40 px-4 py-6 text-sm text-clay transition hover:border-gold hover:text-cocoa"
          >
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
            {uploading ? 'Uploading…' : 'Upload images from your device'}
          </button>

          {form.images.filter((i) => i.url).length === 0 && (
            <p className="text-xs text-clay">
              No images yet. Upload above, or paste an image URL with “Add image URL”.
            </p>
          )}

          {form.images.map((img, i) => (
            <div key={i} className="flex flex-wrap items-center gap-3 rounded-lg border border-champagne p-3">
              <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded bg-cream">
                {img.url && (
                  <Image src={img.url} alt={img.alt || 'preview'} fill sizes="48px" className="object-cover" />
                )}
              </div>
              <input
                value={img.url}
                onChange={(e) =>
                  set('images', form.images.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))
                }
                className="input min-w-[160px] flex-1"
                placeholder="Image URL (or upload above)"
              />
              <input
                value={img.alt}
                onChange={(e) =>
                  set('images', form.images.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))
                }
                className="input min-w-[160px] flex-1"
                placeholder="Alt text (for SEO & accessibility)"
              />
              <label className="flex items-center gap-1.5 text-xs text-cocoa">
                <input
                  type="radio"
                  name="primary-image"
                  checked={img.isPrimary}
                  onChange={() =>
                    set('images', form.images.map((x, j) => ({ ...x, isPrimary: j === i })))
                  }
                  className="accent-[#B08D57]"
                />
                Primary
              </label>
              <button
                type="button"
                onClick={() => set('images', form.images.filter((_, j) => j !== i))}
                className="icon-btn h-8 w-8 text-clay hover:text-red-600"
                aria-label="Remove image"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => set('images', [...form.images, { url: '', alt: '', isPrimary: form.images.length === 0 }])}
            className="btn-outline"
          >
            <Plus className="h-4 w-4" /> Add image URL
          </button>
        </div>
      </Section>

      {/* SEO */}
      <Section title="SEO">
        <Field label={`SEO title (${form.seoTitle.length}/70)`} className="sm:col-span-3">
          <input maxLength={70} value={form.seoTitle} onChange={(e) => set('seoTitle', e.target.value)} className="input" placeholder="Defaults to product name if left blank" />
        </Field>
        <Field label={`SEO description (${form.seoDescription.length}/160)`} className="sm:col-span-3">
          <textarea maxLength={160} value={form.seoDescription} onChange={(e) => set('seoDescription', e.target.value)} className="input min-h-20" placeholder="Defaults to short description if left blank" />
        </Field>
      </Section>

      {/* Flags */}
      <Section title="Visibility">
        <div className="sm:col-span-3 flex flex-wrap gap-6">
          <Toggle label="Featured" checked={form.isFeatured} onChange={(v) => set('isFeatured', v)} />
          <Toggle label="New arrival" checked={form.isNewArrival} onChange={(v) => set('isNewArrival', v)} />
          <Toggle label="Active (visible in store)" checked={form.isActive} onChange={(v) => set('isActive', v)} />
        </div>
      </Section>

      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? 'Save changes' : 'Create product'}
        </button>
        <Link href="/admin/products" className="btn-ghost">Cancel</Link>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-6">
      <h2 className="mb-5 font-serif text-xl text-cocoa">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-3">{children}</div>
    </div>
  );
}

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm text-cocoa">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[#B08D57]" />
      {label}
    </label>
  );
}
