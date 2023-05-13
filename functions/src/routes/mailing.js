import { Router } from 'express';
import { mailingPostHandler } from '../handlers/mailingHandlers.js';

const router = Router();

router
  .post('/', mailingPostHandler)
  .get('/', (req, res) => res.send({ message: 'Get OK' }));

export default router;
