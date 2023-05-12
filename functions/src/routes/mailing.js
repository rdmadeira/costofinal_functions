import { Router } from 'express';
import { mailingGetHandler } from '../handlers/mailingHandlers.js';

const router = Router();

router.post('/', mailingGetHandler);

export default router;
