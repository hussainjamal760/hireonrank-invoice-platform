import { Router, Response, NextFunction } from 'express';
import { authenticateToken, requireCompany, requireRole, AuthRequest } from '../middleware/auth';
import { PayrollInvoice, Employee } from '../models';
import { AccountingService } from '../services/accountingService';

const router = Router();

/**
 * POST /invoice/generate-all
 * Triggers bulk invoice generation for the month.
 */
router.post(
  '/generate-all',
  authenticateToken,
  requireCompany,
  requireRole(['OWNER', 'ADMIN', 'ACCOUNTANT']),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { month } = req.body;
      if (!month || typeof month !== 'string') {
        return res.status(400).json({ message: 'Month is required (format YYYY-MM)' });
      }

      const companyId = req.user!.currentCompanyId as string;
      const userId = req.user!.userId;

      const results = await AccountingService.generateMonthlyRun(companyId, month, userId);

      return res.status(200).json({
        success: true,
        message: `Successfully processed payroll and invoices for ${month}`,
        results
      });
    } catch (err: any) {
      next(err);
    }
  }
);

/**
 * PATCH /invoice/:id/status
 * Updates the status of a payroll invoice (e.g. mark as paid).
 */
router.patch(
  '/:id/status',
  authenticateToken,
  requireCompany,
  requireRole(['OWNER', 'ADMIN', 'ACCOUNTANT']),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { status } = req.body;
      if (!status || !['generated', 'paid', 'pending'].includes(status)) {
        return res.status(400).json({ message: 'Valid status is required' });
      }

      const companyId = req.user!.currentCompanyId as string;
      const invoice = await PayrollInvoice.findOne({ _id: req.params.id, companyId });
      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }

      invoice.status = status as any;
      await invoice.save();

      return res.status(200).json({ success: true, invoice });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /invoice/:id
 * Fetches invoices dynamically by:
 * - Company ID (if id matches current company ID)
 * - Employee ID (if id belongs to an employee)
 * - Invoice ID (otherwise)
 */
router.get(
  '/:id',
  authenticateToken,
  requireCompany,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { id } = req.params;
      const currentCompanyId = req.user!.currentCompanyId as string;

      // 1. If it matches current company ID, it's fetching all invoices for this company
      if (id === currentCompanyId) {
        const filter: any = { companyId: id };
        if (req.user!.role === 'EMPLOYEE') {
          const employee = await Employee.findOne({ companyId: currentCompanyId, email: req.user!.email });
          if (!employee) return res.status(200).json({ success: true, invoices: [] });
          filter.employeeId = employee._id;
        }

        const invoices = await PayrollInvoice.find(filter).populate('employeeId').sort({ createdAt: -1 });
        return res.status(200).json({ success: true, invoices });
      }

      // 2. Check if it's an employee ID belonging to this company
      const employeeExists = await Employee.exists({ _id: id, companyId: currentCompanyId });
      if (employeeExists) {
        if (req.user!.role === 'EMPLOYEE') {
          const employee = await Employee.findOne({ companyId: currentCompanyId, email: req.user!.email });
          if (!employee || employee._id.toString() !== id) {
            return res.status(403).json({ message: 'Forbidden: Access denied' });
          }
        }

        const invoices = await PayrollInvoice.find({ companyId: currentCompanyId, employeeId: id }).populate('employeeId').sort({ createdAt: -1 });
        return res.status(200).json({ success: true, invoices });
      }

      // 3. Otherwise, treat it as a specific invoice ID lookup
      const invoice = await PayrollInvoice.findById(id).populate('employeeId');
      if (invoice) {
        if (invoice.companyId.toString() !== currentCompanyId) {
          return res.status(403).json({ message: 'Forbidden: Access denied' });
        }

        if (req.user!.role === 'EMPLOYEE') {
          const employee = await Employee.findOne({ companyId: currentCompanyId, email: req.user!.email });
          if (!employee || invoice.employeeId.toString() !== employee._id.toString()) {
            return res.status(403).json({ message: 'Forbidden: Access denied' });
          }
        }

        return res.status(200).json({ success: true, invoice });
      }

      return res.status(404).json({ message: 'Invoice not found' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
