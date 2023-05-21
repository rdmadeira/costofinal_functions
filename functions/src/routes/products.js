import { Router } from 'express';
import { getProductsHandler } from '../handlers/productsHandlers.js';

const router = Router();

router.get('/products', getProductsHandler);
router.get('/', (req, res) => {
  /* getAuth();  Falta hacer algo para manipular acceso a la app*/
  res.send('Setup authorizating first...');
});

export { router as productsRouter };
