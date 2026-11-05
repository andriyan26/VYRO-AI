import { Router } from 'express';
import { getExploreData, search, getSounds, getCategories } from './social.controller';

const router = Router();

router.get('/explore', getExploreData);
router.get('/search', search);
router.get('/sounds', getSounds);
router.get('/categories', getCategories);

export default router;

