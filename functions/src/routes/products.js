import { Router } from 'express';

import {
  getProductsHandler,
  putCreateProductsHandler,
  getCreateProductsHandler,
  getUpdatePriceHandler,
  postUpdatePriceHandler,
} from '../handlers/productsHandlers.js';

const router = Router();

router.get('/', getProductsHandler);
router.get('/create-products', getCreateProductsHandler);
router.put('/create-products', putCreateProductsHandler);
router.get('/update-price', getUpdatePriceHandler);
router.post('/update-price', postUpdatePriceHandler);

export { router as productsRouter };
