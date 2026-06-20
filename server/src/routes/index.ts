import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import authRouter from './auth';
import companiesRouter from './companies';
import employeesRouter from './employees';
import invoicesRouter from './invoices';
import invoiceSingularRouter from './invoiceSingular';
import companySingularRouter from './companySingular';
import payrollRouter from './payroll';
import dashboardRouter from './dashboard';
import uploadRouter from './upload';
import usersRouter from './users';
import invoiceTemplatesRouter from './invoiceTemplates';
import publicRouter from './public';
import clientsRouter from './clients';
import aiInvoiceRouter from './aiInvoice';

const router = Router();

router.use('/auth', authRouter);
router.use('/companies', companiesRouter);
router.use('/employees', employeesRouter);
router.use('/invoices', invoicesRouter);
router.use('/invoice', invoiceSingularRouter);
router.use('/company', companySingularRouter);
router.use('/payroll', payrollRouter);
router.use('/dashboard', dashboardRouter);
router.use('/upload', uploadRouter);
router.use('/users', usersRouter);
router.use('/invoice-templates', invoiceTemplatesRouter);
router.use('/public', publicRouter);
router.use('/clients', clientsRouter);
router.use('/ai/invoice', aiInvoiceRouter);

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: (req as any).user });
});

export default router;
