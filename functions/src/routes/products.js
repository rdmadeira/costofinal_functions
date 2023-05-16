import { Router } from 'express';
import { getProductsHandler } from '../handlers/productsHandlers.js';

const router = Router();

router.get('/', getProductsHandler);

export { router as productsRouter };
