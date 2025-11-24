import { Router } from 'express';
import { startAuth, handleCallback } from '../controllers/integration.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/:platform/auth', startAuth);
router.get('/:platform/callback', authMiddleware, handleCallback);

export default router;
