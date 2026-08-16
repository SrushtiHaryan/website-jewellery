export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: PaginationMeta;
  errors?: { path: string; message: string }[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ImageRef {
  url: string;
  publicId?: string;
  alt: string;
  isPrimary?: boolean;
}

export interface CategoryRef {
  _id: string;
  name: string;
  slug: string;
}

export interface Category extends CategoryRef {
  description?: string;
  parent?: CategoryRef | null;
  image?: ImageRef;
  seoTitle?: string;
  seoDescription?: string;
  heading?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface Collection {
  _id: string;
  name: string;
  slug: string;
  key?: string;
  description?: string;
  tagline?: string;
  image?: ImageRef;
  seoTitle?: string;
  seoDescription?: string;
  isFeatured?: boolean;
  isActive?: boolean;
}

export interface Product {
  id: string;
  _id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription?: string;
  category: CategoryRef;
  subcategory?: CategoryRef | null;
  collections?: { _id: string; name: string; slug: string }[];
  price: number;
  discountPercent: number;
  finalPrice: number;
  discountAmount: number;
  stock: number;
  inStock: boolean;
  lowStockThreshold?: number;
  isActive: boolean;
  material?: string;
  metalType?: string;
  stoneType?: string;
  weightGrams?: number;
  dimensions?: string;
  sizes: string[];
  occasion: string[];
  tags: string[];
  images: ImageRef[];
  isFeatured: boolean;
  isNewArrival: boolean;
  averageRating: number;
  reviewCount: number;
  salesCount: number;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
}

export interface CartLine {
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    image?: string;
    price: number;
    discountPercent: number;
    finalPrice: number;
    stock: number;
  };
  quantity: number;
  size?: string;
  lineTotal: number;
  issue?: 'out_of_stock' | 'insufficient_stock' | 'unavailable';
  _id?: string;
}

export interface CartView {
  items: (CartLine & { _id: string })[];
  pricing: {
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    total: number;
  };
  hasIssues: boolean;
}

export interface Address {
  _id: string;
  label?: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  addresses: Address[];
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'refunded';

export interface OrderItem {
  product: string;
  productName: string;
  slug: string;
  sku: string;
  image?: string;
  priceAtPurchase: number;
  quantity: number;
  size?: string;
  lineTotal: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: string | { _id: string; name: string; email: string };
  items: OrderItem[];
  shippingAddress: Omit<Address, '_id' | 'isDefault' | 'label'>;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  paymentMethod: 'cod' | 'mock' | 'razorpay';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: OrderStatus;
  timeline: { status: OrderStatus; note?: string; at: string }[];
  estimatedDeliveryDate?: string;
  createdAt: string;
}

export interface Review {
  _id: string;
  rating: number;
  title?: string;
  comment: string;
  user: { _id: string; name: string } | string;
  product?: string;
  createdAt: string;
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: ImageRef;
  author: { name: string } | string;
  category?: string;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  isPublished?: boolean;
  publishedAt?: string;
  createdAt: string;
}
