import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: (req as any).user });
});

export default router;
