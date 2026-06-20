import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import authRouter from './auth';
import companiesRouter from './companies';

const router = Router();

router.use('/auth', authRouter);
router.use('/companies', companiesRouter);

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: (req as any).user });
});

export default router;
