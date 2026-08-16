import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createOrderSchema,
  orderIdParamSchema,
  cancelOrderSchema,
  listOrdersQuerySchema,
} from '../validators/order.validators';

const router = Router();

// Customer order endpoints.
router.use(authenticate);

router.post('/', validate(createOrderSchema), orderController.create);
router.get('/', validate(listOrdersQuerySchema), orderController.listMine);
router.get('/:id', validate(orderIdParamSchema), orderController.getMine);
router.post('/:id/cancel', validate(cancelOrderSchema), orderController.cancelMine);

export default router;
