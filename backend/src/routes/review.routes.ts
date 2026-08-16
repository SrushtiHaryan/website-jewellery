import { Router } from 'express';
import { reviewController } from '../controllers/review.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createReviewSchema,
  reviewProductSlugSchema,
} from '../validators/review.validators';

const router = Router();

// Public: read approved reviews for a product.
router.get('/product/:slug', validate(reviewProductSlugSchema), reviewController.listByProduct);

// Authenticated: write a review (purchase-verified in the service).
router.post('/', authenticate, validate(createReviewSchema), reviewController.create);

export default router;
