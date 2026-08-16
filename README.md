# Aurelia — Premium Indian Jewellery E-Commerce Platform

A production-quality, full-stack e-commerce platform for a premium Indian jewellery
brand. Built with a clean separation between a **Next.js** storefront and a
**Node.js/Express + MongoDB** REST API.

> **Aesthetic:** Luxury × Indian Heritage × Modern Design × Trust
> **Engineering:** Clean architecture × Security × SEO × Performance × Maintainability

---

## Status

| Area | Status |
| --- | --- |
| Backend API (auth, catalogue, cart, checkout, orders, reviews, wishlist, admin, blog) | ✅ Complete & tested |
| Database models, indexes, seed data | ✅ Complete (29 products, 11 categories, 6 collections, blog, demo users) |
| Payment abstraction (COD, Mock, Razorpay-ready) | ✅ Complete |
| Critical-flow tests | ✅ 19 passing |
| Frontend storefront (home, shop, category, product, cart, checkout, account, blog) | ✅ Complete |
| Admin dashboard (analytics, products, inventory, orders, categories, collections, reviews, blog) | ✅ Complete |
| SEO (dynamic metadata, JSON-LD, sitemap.xml, robots.txt, canonical URLs) | ✅ Complete |
| Production build | ✅ Passes (27 routes) |

---

## Tech Stack

**Backend:** Node.js, Express, TypeScript, MongoDB, Mongoose, JWT, bcrypt, Zod,
Helmet, CORS, rate limiting.
**Frontend (planned):** Next.js (App Router), React, TypeScript, Tailwind CSS,
React Hook Form, Zod.
**Services (integration-ready):** Cloudinary (images), Razorpay (payments),
Nodemailer (email).

---

## Architecture

```
website-jewellery/
├── backend/            # Node.js + Express REST API
│   ├── src/
│   │   ├── config/     # env + database (with zero-install in-memory MongoDB)
│   │   ├── models/     # Mongoose schemas (User, Product, Category, Collection,
│   │   │               #   Cart, Order, Review, Wishlist, BlogPost)
│   │   ├── validators/ # Zod request schemas
│   │   ├── middleware/ # auth, authorize, validate, error handling, rate limiting
│   │   ├── services/   # business logic (auth, product, cart, order, payment, …)
│   │   ├── controllers/# thin HTTP handlers
│   │   ├── routes/     # REST routing
│   │   ├── seed/       # demo data + seed runner
│   │   ├── utils/      # ApiError, pricing, jwt, slug, logger, response envelope
│   │   ├── app.ts      # Express app factory
│   │   └── server.ts   # bootstrap (connect DB, auto-seed, listen)
│   └── tests/          # Vitest + Supertest API tests
├── frontend/           # Next.js storefront + admin (next phase)
├── .env.example
└── README.md
```

Business logic lives in **services**; controllers stay thin; every response uses a
single envelope: `{ success, data, meta?, message? }`.

---

## Getting Started (Backend)

### Prerequisites
- Node.js 20+ (tested on v24)
- No database installation required for local dev — an **in-memory MongoDB replica
  set** starts automatically. For persistence, set `MONGODB_URI` to a local `mongod`
  or MongoDB Atlas cluster.

### Install & run

```bash
cd backend
npm install
npm run dev
```

On first start the API will:
1. Start an in-memory MongoDB replica set (downloads the binary once), and
2. Auto-seed the catalogue if it is empty.

The API listens on **http://localhost:5000**. Health check: `GET /api/health`.

### Useful scripts

```bash
npm run dev        # start with hot reload (auto-seeds an empty DB)
npm run build      # compile TypeScript to dist/
npm start          # run the compiled server
npm run seed       # seed a persistent database (set MONGODB_URI first)
npm run typecheck  # tsc --noEmit
npm test           # run the Vitest API suite
```

### Environment variables

Copy `.env.example` to `backend/.env`. In development every value has a safe
default — you only need real values for production and third-party integrations.
Leaving `MONGODB_URI` empty enables the in-memory database.

---

## Getting Started (Frontend)

In a second terminal (keep the backend running):

```bash
cd frontend
npm install
npm run dev
```

The storefront runs at **http://localhost:3000**. Config lives in `frontend/.env.local`
(`NEXT_PUBLIC_API_URL` points at the backend). Useful scripts:

```bash
npm run dev        # start the Next.js dev server
npm run build      # production build
npm start          # serve the production build
npm run typecheck  # tsc --noEmit
```

> The frontend expects the backend to be running for data (SSR fetches and
> client actions). Start the backend first.

## Try It (demo flow)

1. Visit `http://localhost:3000` and browse the shop, filters and a product page.
2. Sign in as the **customer** (see below), add to cart, and complete checkout
   with the Mock payment — watch stock decrement and the order appear under
   *My Account → Orders* with a tracking timeline.
3. Sign in as the **admin** to see the dashboard, manage products/inventory,
   advance order statuses, and moderate reviews.

## Demo Accounts (development only)

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@example.com` | `Admin@123` |
| Customer | `customer@example.com` | `Customer@123` |

> These are seed credentials for local development. Do not use them in production.

---

## API Overview

Base path: `/api`

| Group | Endpoints (summary) |
| --- | --- |
| `auth` | register, login, logout, refresh, forgot/reset/change password |
| `users` | profile, address CRUD + default |
| `products` | list (filter/sort/search/paginate), by slug, related |
| `categories` / `collections` | list, by slug |
| `cart` | get, add, update qty, remove, clear (live stock + pricing) |
| `orders` | create (checkout), list mine, get, cancel |
| `reviews` | list by product, create (purchase-verified) |
| `wishlist` | get, add, remove, move-to-cart |
| `blog` | list, by slug |
| `admin` | dashboard, product/category/collection/blog CRUD, inventory, order & review management |

### Key guarantees
- **Prices and stock are always recalculated server-side** at checkout — client
  totals are never trusted.
- **Inventory is decremented atomically** inside a MongoDB transaction to prevent
  overselling; cancellations restock.
- **Orders store product snapshots** (name, SKU, price at purchase, image) so past
  orders never change when the catalogue is edited.
- **Reviews require a delivered order** for that product; one review per user per
  product.
- Passwords are hashed (bcrypt) and never returned; JWT access/refresh tokens are
  issued as httpOnly cookies and Bearer tokens.

---

## Testing

```bash
cd backend
npm test
```

Covers authentication (incl. weak-password and bad-credential rejection),
product listing/filtering/search, cart stock validation, full checkout (order
creation + cart clearing + inventory decrement), and role-based authorization.

---

## Pricing Rules

- GST: 3% (jewellery)
- Shipping: free over ₹2,000, otherwise ₹99
- Discounts are driven by each product's `discountPercent` (list price → final price)

---

## Roadmap (future enhancements)

- Cloudinary image uploads from the admin (currently image URLs).
- Razorpay live integration (the payment abstraction is already Razorpay-ready).
- Transactional email via SMTP/Nodemailer (currently logged to console).
- Coupons, gift cards, loyalty points, recently-viewed, abandoned-cart emails.
- Guest cart with merge-on-login (cart currently requires sign-in).

---

## License

MIT
