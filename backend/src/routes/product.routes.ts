import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { validate } from '../middleware/validate';
import {
  listProductsSchema,
  productSlugSchema,
} from '../validators/product.validators';

const router = Router();

// Public, read-only catalogue endpoints. Admin write endpoints live in
// /api/admin/products.
router.get('/', validate(listProductsSchema), productController.list);
router.get('/:slug', validate(productSlugSchema), productController.getBySlug);
router.get('/:slug/related', validate(productSlugSchema), productController.getRelated);

export default router;
