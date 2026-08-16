import { Request, Response } from 'express';
import { adminService } from '../services/admin.service';
import { productService } from '../services/product.service';
import { uploadService } from '../services/upload.service';
import { categoryService } from '../services/category.service';
import { collectionService } from '../services/collection.service';
import { blogService } from '../services/blog.service';
import { Category } from '../models/Category';
import { Collection } from '../models/Collection';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, buildPaginationMeta } from '../utils/apiResponse';

export const adminController = {
  // ---- Dashboard ----
  dashboard: asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(res, await adminService.getDashboardStats());
  }),

  // ---- Image uploads (Cloudinary) ----
  uploadImages: asyncHandler(async (req: Request, res: Response) => {
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    if (files.length === 0) {
      return sendSuccess(res, [], { message: 'No files received.' });
    }
    const uploaded = await Promise.all(files.map((f) => uploadService.uploadBuffer(f.buffer)));
    return sendSuccess(res, uploaded, { status: 201, message: 'Images uploaded.' });
  }),

  // ---- Products ----
  listProducts: asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const { items, total } = await adminService.listProducts({
      page,
      limit,
      search: req.query.search as string | undefined,
    });
    sendSuccess(res, items, { meta: buildPaginationMeta(page, limit, total) });
  }),

  getProduct: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.getById(req.params.id);
    sendSuccess(res, product);
  }),

  createProduct: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.create(req.body);
    sendSuccess(res, product, { status: 201, message: 'Product created.' });
  }),

  updateProduct: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.update(req.params.id, req.body);
    sendSuccess(res, product, { message: 'Product updated.' });
  }),

  deleteProduct: asyncHandler(async (req: Request, res: Response) => {
    await productService.remove(req.params.id);
    sendSuccess(res, null, { message: 'Product deleted.' });
  }),

  setProductActive: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.setActive(req.params.id, Boolean(req.body.isActive));
    sendSuccess(res, product, { message: 'Product status updated.' });
  }),

  // ---- Inventory ----
  inventory: asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 50);
    const { items, total } = await adminService.getInventory({ page, limit });
    sendSuccess(res, items, { meta: buildPaginationMeta(page, limit, total) });
  }),

  updateInventory: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.updateInventory(req.params.id, req.body.stock);
    sendSuccess(res, product, { message: 'Inventory updated.' });
  }),

  // ---- Categories ----
  listCategories: asyncHandler(async (_req: Request, res: Response) => {
    const categories = await Category.find().sort({ displayOrder: 1, name: 1 });
    sendSuccess(res, categories);
  }),
  createCategory: asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.create(req.body);
    sendSuccess(res, category, { status: 201, message: 'Category created.' });
  }),
  updateCategory: asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.update(req.params.id, req.body);
    sendSuccess(res, category, { message: 'Category updated.' });
  }),
  deleteCategory: asyncHandler(async (req: Request, res: Response) => {
    await categoryService.remove(req.params.id);
    sendSuccess(res, null, { message: 'Category deleted.' });
  }),

  // ---- Collections ----
  listCollections: asyncHandler(async (_req: Request, res: Response) => {
    const collections = await Collection.find().sort({ displayOrder: 1, name: 1 });
    sendSuccess(res, collections);
  }),
  createCollection: asyncHandler(async (req: Request, res: Response) => {
    const collection = await collectionService.create(req.body);
    sendSuccess(res, collection, { status: 201, message: 'Collection created.' });
  }),
  updateCollection: asyncHandler(async (req: Request, res: Response) => {
    const collection = await collectionService.update(req.params.id, req.body);
    sendSuccess(res, collection, { message: 'Collection updated.' });
  }),
  deleteCollection: asyncHandler(async (req: Request, res: Response) => {
    await collectionService.remove(req.params.id);
    sendSuccess(res, null, { message: 'Collection deleted.' });
  }),
  setCollectionProducts: asyncHandler(async (req: Request, res: Response) => {
    await collectionService.setProducts(req.params.id, req.body.productIds);
    sendSuccess(res, null, { message: 'Collection products updated.' });
  }),

  // ---- Blog ----
  listBlog: asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const { items, total } = await blogService.listAll(page, limit);
    sendSuccess(res, items, { meta: buildPaginationMeta(page, limit, total) });
  }),
  getBlog: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await blogService.getById(req.params.id));
  }),
  createBlog: asyncHandler(async (req: Request, res: Response) => {
    const post = await blogService.create(req.user!.sub, req.body);
    sendSuccess(res, post, { status: 201, message: 'Article created.' });
  }),
  updateBlog: asyncHandler(async (req: Request, res: Response) => {
    const post = await blogService.update(req.params.id, req.body);
    sendSuccess(res, post, { message: 'Article updated.' });
  }),
  deleteBlog: asyncHandler(async (req: Request, res: Response) => {
    await blogService.remove(req.params.id);
    sendSuccess(res, null, { message: 'Article deleted.' });
  }),
};
