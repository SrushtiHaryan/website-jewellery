import { Router } from 'express';
import { categoryController } from '../controllers/category.controller';

const router = Router();

router.get('/', categoryController.list);
router.get('/:slug', categoryController.getBySlug);

export default router;
