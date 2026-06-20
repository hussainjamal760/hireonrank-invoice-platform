import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import authRouter from './auth';
import companiesRouter from './companies';
import employeesRouter from './employees';
import invoicesRouter from './invoices';
import payrollRouter from './payroll';
import dashboardRouter from './dashboard';
import uploadRouter from './upload';
import companySingularRouter from './companySingular';
import employeeSingularRouter from './employeeSingular';
import invoiceSingularRouter from './invoiceSingular';

const router = Router();

router.use('/auth', authRouter);
router.use('/companies', companiesRouter);
router.use('/employees', employeesRouter);
router.use('/invoices', invoicesRouter);
router.use('/payroll', payrollRouter);
router.use('/dashboard', dashboardRouter);
router.use('/upload', uploadRouter);
router.use('/company', companySingularRouter);
router.use('/employee', employeeSingularRouter);
router.use('/invoice', invoiceSingularRouter);


router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: (req as any).user });
});

export default router;
