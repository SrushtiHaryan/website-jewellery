import { Router } from 'express';
import { wishlistController } from '../controllers/wishlist.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  addWishlistSchema,
  wishlistProductParamSchema,
  moveToCartSchema,
} from '../validators/wishlist.validators';

const router = Router();

router.use(authenticate);

router.get('/', wishlistController.get);
router.post('/', validate(addWishlistSchema), wishlistController.add);
router.delete('/:productId', validate(wishlistProductParamSchema), wishlistController.remove);
router.post('/:productId/move-to-cart', validate(moveToCartSchema), wishlistController.moveToCart);

export default router;
