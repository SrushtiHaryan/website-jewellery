/* eslint-disable no-console */
import { User } from '../models/User';
import { Category } from '../models/Category';
import { Collection } from '../models/Collection';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { Review } from '../models/Review';
import { Cart } from '../models/Cart';
import { Wishlist } from '../models/Wishlist';
import { BlogPost } from '../models/BlogPost';
import { toSlug } from '../utils/slug';
import { seedProducts } from './products.data';
import { logger } from '../utils/logger';

// Deterministic placeholder imagery so the store looks populated out of the box.
// Replace with real Cloudinary assets in production.
function buildImages(slug: string, name: string) {
  return [0, 1, 2].map((i) => ({
    url: `https://picsum.photos/seed/aurelia-${slug}-${i}/900/1100`,
    alt: `${name} — view ${i + 1}`,
    isPrimary: i === 0,
  }));
}

const categoriesSeed: Array<{
  name: string;
  parent?: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  displayOrder?: number;
}> = [
  { name: 'Necklaces', description: 'Statement and everyday necklaces, from chokers to rani haars.', displayOrder: 1 },
  { name: 'Chokers', parent: 'Necklaces', description: 'Close-set chokers in Kundan, Polki and gold.' },
  { name: 'Earrings', description: 'Jhumkas, chandbalis, studs and drops.', displayOrder: 2 },
  { name: 'Jhumkas', parent: 'Earrings', description: 'The timeless dome-shaped jhumka in many finishes.' },
  { name: 'Studs', parent: 'Earrings', description: 'Minimal studs for everyday elegance.' },
  { name: 'Rings', description: 'Solitaires, bands and cocktail rings.', displayOrder: 3 },
  { name: 'Bangles', description: 'Kadas, filigree sets and bridal choodas.', displayOrder: 4 },
  { name: 'Bracelets', description: 'Tennis bracelets, cuffs and charm bracelets.', displayOrder: 5 },
  { name: 'Bridal Jewellery', description: 'Complete bridal sets, maang tikkas and more.', displayOrder: 6 },
  { name: 'Gold Jewellery', description: 'Fine 18K and 22K gold pieces.', displayOrder: 7 },
  { name: 'Silver Jewellery', description: 'Oxidised and sterling silver everyday pieces.', displayOrder: 8 },
];

const collectionsSeed: Array<{
  name: string;
  key: string;
  tagline: string;
  description: string;
  isFeatured?: boolean;
  displayOrder?: number;
}> = [
  { name: 'Bridal Collection', key: 'bridal', tagline: 'For the day you will remember forever', description: 'Kundan and Polki sets, choodas and maang tikkas for the modern bride.', isFeatured: true, displayOrder: 1 },
  { name: 'Festive Collection', key: 'festive', tagline: 'Colour, craft and celebration', description: 'Meenakari, temple gold and jewel-toned pieces for the festive season.', isFeatured: true, displayOrder: 2 },
  { name: 'Everyday Elegance', key: 'everyday', tagline: 'The pieces you never take off', description: 'Lightweight, wearable jewellery for daily grace.', isFeatured: true, displayOrder: 3 },
  { name: 'Royal Collection', key: 'royal', tagline: 'Heirlooms in the making', description: 'Regal statement pieces in gold, Polki and precious stones.', isFeatured: true, displayOrder: 4 },
  { name: 'Minimal Collection', key: 'minimal', tagline: 'Quiet luxury, considered design', description: 'Fine, understated jewellery for the modern minimalist.', displayOrder: 5 },
  { name: 'New Arrivals', key: 'new-arrivals', tagline: 'The latest from the atelier', description: 'Our newest designs, fresh from the workshop.', displayOrder: 6 },
];

const blogSeed = [
  {
    title: 'How to Choose a Kundan Necklace',
    excerpt: 'A guide to picking the perfect Kundan piece for your big day.',
    category: 'Buying Guides',
    tags: ['kundan', 'bridal', 'guide'],
    content:
      'Kundan jewellery is one of the oldest forms of Indian craftsmanship, defined by uncut stones set in fine gold foil. When choosing a Kundan necklace, consider the neckline of your outfit, the scale of the piece, and how it will sit with your other jewellery. A choker suits high necklines, while a longer haar balances a deeper neckline. Look closely at the setting — well-made Kundan should have smooth, even foiling and a satisfying weight. Finally, consider the meenakari work on the reverse, a hallmark of true craftsmanship.',
  },
  {
    title: 'Gold vs Silver Jewellery: Which Is Right for You?',
    excerpt: 'Understanding the difference between gold and silver jewellery.',
    category: 'Buying Guides',
    tags: ['gold', 'silver', 'guide'],
    content:
      'Gold and silver each have their place in a considered jewellery wardrobe. Gold — whether 18K or 22K — carries warmth and enduring value, making it ideal for heirloom and bridal pieces. Silver, especially oxidised silver, offers versatility and character at an accessible price, perfect for everyday and contemporary looks. Consider your skin tone, the occasion, and how the piece will be worn before deciding.',
  },
  {
    title: 'A Jewellery Care Guide for Lasting Shine',
    excerpt: 'Simple habits to keep your jewellery looking its best.',
    category: 'Care',
    tags: ['care', 'maintenance'],
    content:
      'Fine jewellery rewards a little care. Store each piece separately to prevent scratching, ideally in a soft pouch or lined box. Keep jewellery away from perfumes, lotions and household chemicals, which can dull stones and tarnish metal. Clean gold and Kundan gently with a soft, dry cloth. For silver, an occasional polish with a specialised cloth restores shine. Always remove jewellery before swimming or bathing.',
  },
  {
    title: 'The Best Jewellery for Indian Weddings',
    excerpt: 'From the bride to the guests — what to wear and how to pair it.',
    category: 'Style',
    tags: ['bridal', 'wedding', 'style'],
    content:
      'Indian weddings are a celebration of colour and craft, and jewellery plays a starring role. Brides traditionally wear a complete set — necklace, earrings, maang tikka and choodas — often in Kundan or Polki. Guests can make an impact with a single statement piece: a pair of chandbalis, a bold cocktail ring, or a layered Kundan necklace. The key is balance: let one piece lead, and keep the rest supporting.',
  },
];

/**
 * Populate the database with demo data. Assumes an active mongoose connection.
 * Clears existing collections first, so it is idempotent.
 */
export async function runSeed(): Promise<void> {
  logger.info('Seeding database…');

  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Collection.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
    Review.deleteMany({}),
    Cart.deleteMany({}),
    Wishlist.deleteMany({}),
    BlogPost.deleteMany({}),
  ]);

  // --- Users ---
  const admin = await User.create({
    name: 'Aurelia Admin',
    email: 'admin@example.com',
    password: 'Admin@123',
    role: 'admin',
    phone: '9000000001',
  });
  const customer = await User.create({
    name: 'Aanya Sharma',
    email: 'customer@example.com',
    password: 'Customer@123',
    role: 'customer',
    phone: '9000000002',
    addresses: [
      {
        label: 'Home',
        fullName: 'Aanya Sharma',
        phone: '9000000002',
        line1: '12 Rose Villa, Bandra West',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400050',
        country: 'India',
        isDefault: true,
      },
    ],
  });

  // --- Categories (parents first, then children) ---
  const categoryByName = new Map<string, string>();
  for (const c of categoriesSeed.filter((cat) => !cat.parent)) {
    const doc = await Category.create({
      name: c.name,
      slug: toSlug(c.name),
      description: c.description,
      seoTitle: c.seoTitle,
      seoDescription: c.seoDescription,
      displayOrder: c.displayOrder ?? 0,
    });
    categoryByName.set(c.name, String(doc._id));
  }
  for (const c of categoriesSeed.filter((cat) => cat.parent)) {
    const doc = await Category.create({
      name: c.name,
      slug: toSlug(c.name),
      description: c.description,
      parent: categoryByName.get(c.parent as string),
      displayOrder: c.displayOrder ?? 0,
    });
    categoryByName.set(c.name, String(doc._id));
  }
  const categoryBySlug = new Map<string, string>();
  (await Category.find()).forEach((c) => categoryBySlug.set(c.slug, String(c._id)));

  // --- Collections ---
  const collectionByKey = new Map<string, string>();
  for (const col of collectionsSeed) {
    const doc = await Collection.create({
      name: col.name,
      slug: toSlug(col.name),
      key: col.key,
      tagline: col.tagline,
      description: col.description,
      isFeatured: col.isFeatured ?? false,
      displayOrder: col.displayOrder ?? 0,
      image: {
        url: `https://picsum.photos/seed/aurelia-col-${col.key}/1200/900`,
        alt: col.name,
      },
    });
    collectionByKey.set(col.key, String(doc._id));
  }

  // --- Products ---
  const productBySku = new Map<string, string>();
  for (const p of seedProducts) {
    const slug = toSlug(p.name);
    const categoryId = categoryBySlug.get(p.categorySlug);
    if (!categoryId) throw new Error(`Unknown category slug: ${p.categorySlug}`);
    const subcategoryId = p.subcategorySlug ? categoryBySlug.get(p.subcategorySlug) : undefined;
    const collectionIds = p.collectionKeys
      .map((k) => collectionByKey.get(k))
      .filter((v): v is string => Boolean(v));

    const doc = await Product.create({
      name: p.name,
      slug,
      sku: p.sku,
      description: p.description,
      shortDescription: p.shortDescription,
      category: categoryId,
      subcategory: subcategoryId ?? null,
      collections: collectionIds,
      price: p.price,
      discountPercent: p.discountPercent,
      stock: p.stock,
      material: p.material,
      metalType: p.metalType,
      stoneType: p.stoneType,
      weightGrams: p.weightGrams,
      dimensions: p.dimensions,
      sizes: p.sizes ?? [],
      occasion: p.occasion,
      tags: p.tags,
      images: buildImages(slug, p.name),
      isFeatured: p.isFeatured ?? false,
      isNewArrival: p.isNewArrival ?? false,
      isActive: true,
      salesCount: p.salesCount ?? 0,
      seoTitle: `${p.name} | Aurelia Jewellery`,
      seoDescription: p.shortDescription,
    });
    productBySku.set(p.sku, String(doc._id));
  }

  // --- A delivered order + genuine reviews (ratings are real, never faked) ---
  const reviewedSkus = ['AUR-ER-001', 'AUR-RG-003', 'AUR-ER-006'];
  const reviewProducts = await Product.find({ sku: { $in: reviewedSkus } });
  const orderItems = reviewProducts.map((prod) => ({
    product: prod._id,
    productName: prod.name,
    slug: prod.slug,
    sku: prod.sku,
    image: prod.images[0]?.url,
    priceAtPurchase: prod.finalPrice,
    quantity: 1,
    lineTotal: prod.finalPrice,
  }));
  const subtotal = orderItems.reduce((s, i) => s + i.lineTotal, 0);
  const tax = Math.round(subtotal * 0.03);
  const order = await Order.create({
    orderNumber: 'AUR-SEED-1001',
    customer: customer._id,
    items: orderItems,
    shippingAddress: {
      fullName: 'Aanya Sharma',
      phone: '9000000002',
      line1: '12 Rose Villa, Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400050',
      country: 'India',
    },
    subtotal,
    discount: 0,
    shipping: 0,
    tax,
    total: subtotal + tax,
    paymentMethod: 'cod',
    paymentStatus: 'paid',
    orderStatus: 'delivered',
    timeline: [
      { status: 'pending', note: 'Order placed', at: new Date(Date.now() - 9 * 864e5) },
      { status: 'confirmed', at: new Date(Date.now() - 8 * 864e5) },
      { status: 'shipped', at: new Date(Date.now() - 5 * 864e5) },
      { status: 'delivered', note: 'Delivered', at: new Date(Date.now() - 3 * 864e5) },
    ],
  });

  const reviewSeed = [
    { sku: 'AUR-ER-001', rating: 5, title: 'Absolutely stunning', comment: 'These jhumkas are lightweight and the antique finish is gorgeous. Got so many compliments!' },
    { sku: 'AUR-RG-003', rating: 4, title: 'Perfect everyday band', comment: 'Simple, elegant and comfortable. Exactly what I wanted for daily wear.' },
    { sku: 'AUR-ER-006', rating: 5, title: 'Timeless', comment: 'Beautiful pearls, great quality. My new go-to earrings.' },
  ];
  for (const r of reviewSeed) {
    const productId = productBySku.get(r.sku)!;
    await Review.create({
      product: productId,
      user: customer._id,
      order: order._id,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      isApproved: true,
    });
    const stats = await Review.aggregate<{ avg: number; count: number }>([
      { $match: { product: reviewProducts.find((p) => String(p._id) === productId)!._id, isApproved: true } },
      { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round((stats[0]?.avg ?? 0) * 10) / 10,
      reviewCount: stats[0]?.count ?? 0,
    });
  }

  // --- Blog ---
  for (const b of blogSeed) {
    await BlogPost.create({
      title: b.title,
      slug: toSlug(b.title),
      excerpt: b.excerpt,
      content: b.content,
      category: b.category,
      tags: b.tags,
      author: admin._id,
      featuredImage: {
        url: `https://picsum.photos/seed/aurelia-blog-${toSlug(b.title)}/1200/700`,
        alt: b.title,
      },
      seoTitle: `${b.title} | Aurelia Journal`,
      seoDescription: b.excerpt,
      isPublished: true,
      publishedAt: new Date(),
    });
  }

  logger.info(
    `Seed complete: ${seedProducts.length} products, ${categoriesSeed.length} categories, ${collectionsSeed.length} collections, ${blogSeed.length} articles.`
  );
  logger.info(
    'Demo accounts — admin@example.com / Admin@123, customer@example.com / Customer@123'
  );
}
