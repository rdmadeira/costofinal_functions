import { Router } from 'express';
import multer from 'multer';
import {
  getProductsHandler,
  putProductsHandler,
  getUpdatePriceHandler,
  postUpdatePriceHandler,
} from '../handlers/productsHandlers.js';

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get('/', getProductsHandler);
router.put('/', putProductsHandler);
router.get('/update-price', getUpdatePriceHandler);
router.post(
  '/update-price',
  upload.single('fileUpload'),
  postUpdatePriceHandler
);

export { router as productsRouter };
