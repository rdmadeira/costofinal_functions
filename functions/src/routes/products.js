import { Router } from 'express';

import {
  getProductsHandler,
  postCreateProductsHandler,
  getCreateProductsHandler,
  getUpdatePriceHandler,
  postUpdatePriceHandler,
  getXlsProductsHandler,
} from '../handlers/productsHandlers.js';

const router = Router();

router.get('/', getProductsHandler);
router.get('/products-to-excel', getXlsProductsHandler);
router.get('/create-products', getCreateProductsHandler);
router.post('/create-products', postCreateProductsHandler);
router.get('/update-price', getUpdatePriceHandler);
router.post('/update-price', postUpdatePriceHandler);

export { router as productsRouter };
