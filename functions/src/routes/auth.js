import { Router } from 'express';
import { authAdminHandler } from '../handlers/authHandlers.js';

const router = Router();

router.post('/', authAdminHandler);

export { router as authRouter };
