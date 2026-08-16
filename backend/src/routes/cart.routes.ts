import { Router } from 'express';
import { cartController } from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  addToCartSchema,
  updateCartItemSchema,
  cartItemParamSchema,
} from '../validators/cart.validators';

const router = Router();

router.use(authenticate);

router.get('/', cartController.get);
router.post('/items', validate(addToCartSchema), cartController.add);
router.patch('/items/:itemId', validate(updateCartItemSchema), cartController.update);
router.delete('/items/:itemId', validate(cartItemParamSchema), cartController.remove);
router.delete('/', cartController.clear);

export default router;
