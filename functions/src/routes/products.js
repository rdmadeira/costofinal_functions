import { Router } from 'express';
import {
  getProductsHandler,
  putProductsHandler,
  postUpdatePriceHandler,
} from '../handlers/productsHandlers.js';

const router = Router();

router.get('/', getProductsHandler);
router.put('/', putProductsHandler);
router.post('/update-price', postUpdatePriceHandler);

export { router as productsRouter };
