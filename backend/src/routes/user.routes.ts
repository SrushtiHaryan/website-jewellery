import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  updateProfileSchema,
  createAddressSchema,
  updateAddressSchema,
  addressIdParamSchema,
} from '../validators/user.validators';

const router = Router();

// Everything here requires an authenticated user.
router.use(authenticate);

router.get('/me', userController.getProfile);
router.patch('/me', validate(updateProfileSchema), userController.updateProfile);

router.get('/me/addresses', userController.listAddresses);
router.post('/me/addresses', validate(createAddressSchema), userController.addAddress);
router.patch(
  '/me/addresses/:addressId',
  validate(updateAddressSchema),
  userController.updateAddress
);
router.delete(
  '/me/addresses/:addressId',
  validate(addressIdParamSchema),
  userController.deleteAddress
);
router.patch(
  '/me/addresses/:addressId/default',
  validate(addressIdParamSchema),
  userController.setDefaultAddress
);

export default router;
