import { Router } from 'express';
import { collectionController } from '../controllers/collection.controller';

const router = Router();

router.get('/', collectionController.list);
router.get('/:slug', collectionController.getBySlug);

export default router;
