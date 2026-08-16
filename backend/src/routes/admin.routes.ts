import { Router } from 'express';
import multer from 'multer';
import { adminController } from '../controllers/admin.controller';
import { orderController } from '../controllers/order.controller';
import { reviewController } from '../controllers/review.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createProductSchema,
  updateProductSchema,
  updateInventorySchema,
  productIdSchema,
} from '../validators/product.validators';
import {
  createCategorySchema,
  updateCategorySchema,
  idParamSchema,
} from '../validators/category.validators';
import {
  createCollectionSchema,
  updateCollectionSchema,
  setCollectionProductsSchema,
} from '../validators/collection.validators';
import { createBlogSchema, updateBlogSchema, blogIdParamSchema } from '../validators/blog.validators';
import {
  listOrdersQuerySchema,
  orderIdParamSchema,
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
} from '../validators/order.validators';
import { moderateReviewSchema, reviewIdParamSchema } from '../validators/review.validators';

const router = Router();

// Every admin route requires an authenticated admin.
router.use(authenticate, authorize('admin'));

// In-memory upload buffer (images stream straight to Cloudinary; max 8MB each).
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 8 },
  fileFilter: (_req, file, cb) => cb(null, file.mimetype.startsWith('image/')),
});

// Dashboard
router.get('/dashboard', adminController.dashboard);

// Image uploads
router.post('/uploads', upload.array('images', 8), adminController.uploadImages);

// Products
router.get('/products', adminController.listProducts);
router.get('/products/:id', validate(productIdSchema), adminController.getProduct);
router.post('/products', validate(createProductSchema), adminController.createProduct);
router.patch('/products/:id', validate(updateProductSchema), adminController.updateProduct);
router.delete('/products/:id', validate(productIdSchema), adminController.deleteProduct);
router.patch('/products/:id/active', validate(productIdSchema), adminController.setProductActive);

// Inventory
router.get('/inventory', adminController.inventory);
router.patch('/inventory/:id', validate(updateInventorySchema), adminController.updateInventory);

// Categories
router.get('/categories', adminController.listCategories);
router.post('/categories', validate(createCategorySchema), adminController.createCategory);
router.patch('/categories/:id', validate(updateCategorySchema), adminController.updateCategory);
router.delete('/categories/:id', validate(idParamSchema), adminController.deleteCategory);

// Collections
router.get('/collections', adminController.listCollections);
router.post('/collections', validate(createCollectionSchema), adminController.createCollection);
router.patch('/collections/:id', validate(updateCollectionSchema), adminController.updateCollection);
router.delete('/collections/:id', validate(idParamSchema), adminController.deleteCollection);
router.put(
  '/collections/:id/products',
  validate(setCollectionProductsSchema),
  adminController.setCollectionProducts
);

// Orders
router.get('/orders', validate(listOrdersQuerySchema), orderController.listAll);
router.get('/orders/:id', validate(orderIdParamSchema), orderController.getOne);
router.patch('/orders/:id/status', validate(updateOrderStatusSchema), orderController.updateStatus);
router.patch(
  '/orders/:id/payment',
  validate(updatePaymentStatusSchema),
  orderController.updatePaymentStatus
);

// Reviews (moderation)
router.get('/reviews', reviewController.listAll);
router.patch('/reviews/:id', validate(moderateReviewSchema), reviewController.moderate);
router.delete('/reviews/:id', validate(reviewIdParamSchema), reviewController.remove);

// Blog
router.get('/blog', adminController.listBlog);
router.get('/blog/:id', validate(blogIdParamSchema), adminController.getBlog);
router.post('/blog', validate(createBlogSchema), adminController.createBlog);
router.patch('/blog/:id', validate(updateBlogSchema), adminController.updateBlog);
router.delete('/blog/:id', validate(blogIdParamSchema), adminController.deleteBlog);

export default router;
