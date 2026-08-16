import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import type { Application } from 'express';
import { createApp } from '../src/app';

let app: Application;
let customerToken: string;
let adminToken: string;
let firstProduct: { id: string; slug: string; stock: number };

beforeAll(() => {
  app = createApp();
});

async function login(email: string, password: string): Promise<string> {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  expect(res.status).toBe(200);
  return res.body.data.accessToken as string;
}

describe('Auth', () => {
  it('logs in the seeded customer', async () => {
    customerToken = await login('customer@example.com', 'Customer@123');
    expect(customerToken).toBeTruthy();
  });

  it('logs in the seeded admin', async () => {
    adminToken = await login('admin@example.com', 'Admin@123');
    expect(adminToken).toBeTruthy();
  });

  it('rejects invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'customer@example.com', password: 'wrong-password' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('registers a new customer', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'Test@1234',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe('customer');
    // Never leak the password hash.
    expect(res.body.data.user.password).toBeUndefined();
  });

  it('rejects weak passwords', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Weak',
      email: `weak-${Date.now()}@example.com`,
      password: 'weak',
    });
    expect(res.status).toBe(400);
  });
});

describe('Products', () => {
  it('lists products with pagination', async () => {
    const res = await request(app).get('/api/products?limit=5');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(5);
    expect(res.body.meta.total).toBeGreaterThan(20);
    firstProduct = res.body.data[0];
  });

  it('computes finalPrice from discountPercent', async () => {
    const res = await request(app).get('/api/products?limit=60');
    const discounted = res.body.data.find((p: { discountPercent: number }) => p.discountPercent > 0);
    expect(discounted.finalPrice).toBeLessThan(discounted.price);
  });

  it('filters by category slug', async () => {
    const res = await request(app).get('/api/products?category=necklaces');
    expect(res.status).toBe(200);
    expect(res.body.meta.total).toBeGreaterThan(0);
  });

  it('searches full text', async () => {
    const res = await request(app).get('/api/products?search=kundan');
    expect(res.status).toBe(200);
    expect(res.body.meta.total).toBeGreaterThan(0);
  });

  it('fetches a product by slug', async () => {
    const res = await request(app).get(`/api/products/${firstProduct.slug}`);
    expect(res.status).toBe(200);
    expect(res.body.data.slug).toBe(firstProduct.slug);
  });

  it('returns 404 for an unknown slug', async () => {
    const res = await request(app).get('/api/products/does-not-exist-xyz');
    expect(res.status).toBe(404);
  });
});

describe('Cart', () => {
  it('requires authentication', async () => {
    const res = await request(app).get('/api/cart');
    expect(res.status).toBe(401);
  });

  it('adds an item and computes pricing', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId: firstProduct.id, quantity: 2 });
    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBeGreaterThan(0);
    expect(res.body.data.pricing.total).toBeGreaterThan(0);
  });

  it('rejects quantities beyond stock', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId: firstProduct.id, quantity: 9999 });
    expect(res.status).toBe(400);
  });
});

describe('Checkout & orders', () => {
  it('creates an order, clears the cart and reduces stock', async () => {
    const before = await request(app).get(`/api/products/${firstProduct.slug}`);
    const stockBefore = before.body.data.stock;

    const addrRes = await request(app)
      .get('/api/users/me/addresses')
      .set('Authorization', `Bearer ${customerToken}`);
    const addressId = addrRes.body.data[0]._id;

    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ addressId, paymentMethod: 'mock' });
    expect(orderRes.status).toBe(201);
    expect(orderRes.body.data.orderStatus).toBe('confirmed');
    expect(orderRes.body.data.paymentStatus).toBe('paid');

    const cartRes = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(cartRes.body.data.items.length).toBe(0);

    const after = await request(app).get(`/api/products/${firstProduct.slug}`);
    expect(after.body.data.stock).toBe(stockBefore - 2);
  });

  it('rejects checkout with an empty cart', async () => {
    const addrRes = await request(app)
      .get('/api/users/me/addresses')
      .set('Authorization', `Bearer ${customerToken}`);
    const addressId = addrRes.body.data[0]._id;
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ addressId, paymentMethod: 'cod' });
    expect(res.status).toBe(400);
  });
});

describe('Authorization', () => {
  it('forbids a customer from the admin dashboard', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(403);
  });

  it('allows an admin to view the dashboard', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.totalProducts).toBeGreaterThan(0);
  });

  it('allows an admin to create a product', async () => {
    const catRes = await request(app).get('/api/categories');
    const categoryId = catRes.body.data[0]._id;
    const res = await request(app)
      .post('/api/admin/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Admin Product',
        sku: `TEST-${Date.now()}`,
        description: 'A product created during automated tests.',
        category: categoryId,
        price: 1000,
        stock: 5,
      });
    expect(res.status).toBe(201);
    expect(res.body.data.slug).toBeTruthy();
  });
});
