import { Router } from 'express';
import { getImagesUrl } from '../handlers/imagesHandler.js';

const router = Router();

router.post('/', getImagesUrl);

export { router as imagesRouter };
