import { Router } from 'express';

import {
  getProductsHandler,
  putProductsHandler,
  getUpdatePriceHandler,
  postUpdatePriceHandler,
} from '../handlers/productsHandlers.js';

const router = Router();

router.get('/', getProductsHandler);
router.put('/', putProductsHandler);
router.get('/update-price', getUpdatePriceHandler);
router.post('/update-price', postUpdatePriceHandler);

export { router as productsRouter };
