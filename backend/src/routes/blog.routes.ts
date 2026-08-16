import { Router } from 'express';
import { blogController } from '../controllers/blog.controller';

const router = Router();

router.get('/', blogController.list);
router.get('/:slug', blogController.getBySlug);

export default router;
