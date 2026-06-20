import { Router, Request, Response, NextFunction } from 'express';
import { Employee, PayrollRecord, ActivityLog, Payroll, Company } from '../models';
import { authenticateToken, requireCompany, requireRole, AuthRequest } from '../middleware/auth';
import { AccountingService } from '../services/accountingService';
import { generateSalarySlipPDF } from '../utils/pdfGenerator';

const router = Router();

/**
 * GET /payroll/:id/download
 * Generates and downloads the salary slip PDF for a specific payroll record.
 */
router.get(
  '/:id/download',
  authenticateToken,
  requireCompany,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      const companyId = req.user!.currentCompanyId as string;
      const record = await PayrollRecord.findOne({ _id: req.params.id, companyId });

      if (!record) {
        return res.status(404).json({ message: 'Payroll record not found' });
      }

      // Security: Employees can only download their own slips
      if (req.user!.role === 'EMPLOYEE' && record.employeeEmail !== req.user!.email) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const company = await Company.findById(companyId);
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }

      const pdfBuffer = await generateSalarySlipPDF(record, company);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=SalarySlip_${record.period.replace(/\s+/g, '_')}.pdf`);
      return res.send(Buffer.from(pdfBuffer));
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /payroll/summary
 * Returns an aggregated payroll summary for a given period.
 * Accessible by OWNER, ADMIN, and ACCOUNTANT roles.
 *
 * Query params:
 *   - period (required): e.g. 'June 2026'
 *
 * NOTE: This route is registered BEFORE /:id to prevent 'summary'
 * from being captured as an :id parameter.
 */
router.get(
  '/summary',
  authenticateToken,
  requireCompany,
  requireRole(['OWNER', 'ADMIN', 'ACCOUNTANT']),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { period } = req.query;

      if (!period || typeof period !== 'string') {
        return res.status(400).json({ message: 'Period query parameter is required' });
      }

      const companyId = req.user!.currentCompanyId as string;

      const aggregation = await PayrollRecord.aggregate([
        { $match: { companyId: { $eq: companyId }, period } },
        {
          $group: {
            _id: null,
            totalBaseSalary: { $sum: '$baseSalary' },
            totalDeductions: { $sum: '$deductions' },
            totalBonuses: { $sum: '$bonuses' },
            totalNetPay: { $sum: '$netPay' },
            count: { $sum: 1 }
          }
        }
      ]);

      // Get status breakdown separately for clarity
      const statusBreakdown = await PayrollRecord.aggregate([
        { $match: { companyId: { $eq: companyId }, period } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const summary = aggregation[0] || {
        totalBaseSalary: 0,
        totalDeductions: 0,
        totalBonuses: 0,
        totalNetPay: 0,
        count: 0
      };

      // Remove the internal _id field from the aggregate result
      delete summary._id;

      // Convert statusBreakdown array into a keyed object { PENDING: 2, PAID: 5, ... }
      summary.statusBreakdown = statusBreakdown.reduce(
        (acc: Record<string, number>, item: { _id: string; count: number }) => {
          acc[item._id] = item.count;
          return acc;
        },
        {} as Record<string, number>
      );

      return res.status(200).json(summary);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /payroll/generate
 * Generate payroll records for a given period.
 * Restricted to OWNER and ADMIN roles.
 *
 * Body:
 *   - period (string, required): e.g. 'June 2026'
 *   - employeeIds (string[], optional): specific employees; defaults to ALL active employees
 *   - deductions (number, optional): amount to deduct from each record (default 0)
 *   - bonuses (number, optional): bonus amount to add to each record (default 0)
 */
router.post(
  '/generate',
  authenticateToken,
  requireCompany,
  requireRole(['OWNER', 'ADMIN']),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { period, employeeIds, deductions = 0, bonuses = 0 } = req.body;

      if (!period || typeof period !== 'string') {
        return res.status(400).json({ message: 'Period is required' });
      }

      const companyId = req.user!.currentCompanyId as string;
      const userId = req.user!.userId;

      // Fetch employees — either specified IDs or all active employees in the company
      let employees;
      if (employeeIds && Array.isArray(employeeIds) && employeeIds.length > 0) {
        employees = await Employee.find({
          _id: { $in: employeeIds },
          companyId,
          status: 'ACTIVE'
        });
      } else {
        employees = await Employee.find({ companyId, status: 'ACTIVE' });
      }

      if (employees.length === 0) {
        return res.status(404).json({ message: 'No active employees found' });
      }

      // Check which employees already have a payroll record for this period
      const existingRecords = await PayrollRecord.find({
        companyId,
        period,
        employeeId: { $in: employees.map((e: any) => e._id) }
      }).select('employeeId');

      const existingEmployeeIds = new Set(
        existingRecords.map((r: any) => r.employeeId.toString())
      );

      // Build new records, skipping duplicates
      const newRecords: any[] = [];
      let skipped = 0;

      for (const employee of employees) {
        if (existingEmployeeIds.has(employee._id.toString())) {
          skipped++;
          continue;
        }

        const baseSalary = employee.salary;
        const netPay = baseSalary - deductions + bonuses;

        newRecords.push({
          companyId,
          employeeId: employee._id,
          employeeName: employee.name,
          employeeEmail: employee.email,
          period,
          baseSalary,
          deductions,
          bonuses,
          netPay,
          status: 'PENDING',
          generatedBy: userId
        });
      }

      // Bulk insert all new records
      const records = newRecords.length > 0
        ? await PayrollRecord.insertMany(newRecords)
        : [];

      // Log the activity
      await ActivityLog.create({
        companyId,
        userId,
        action: 'PAYROLL_GENERATED',
        description: `Payroll generated for period "${period}" — ${records.length} created, ${skipped} skipped`,
        metadata: { period, generated: records.length, skipped }
      });

      return res.status(201).json({
        generated: records.length,
        skipped,
        records
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /payroll
 * List payroll records with pagination and optional filters.
 *
 * Query params:
 *   - page (number, default 1)
 *   - limit (number, default 20)
 *   - period (string, optional)
 *   - status (string, optional): PENDING | PROCESSED | PAID
 *   - employeeId (string, optional)
 */
router.get(
  '/',
  authenticateToken,
  requireCompany,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      const companyId = req.user!.currentCompanyId as string;
      const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
      const limit = Math.min(Math.max(parseInt(req.query.limit as string, 10) || 20, 1), 100);
      const skip = (page - 1) * limit;

      // Build filter
      const filter: Record<string, any> = { companyId };

      if (req.user!.role === 'EMPLOYEE') {
        filter.employeeEmail = req.user!.email;
      }

      if (req.query.period && typeof req.query.period === 'string') {
        filter.period = req.query.period;
      }
      if (req.query.status && typeof req.query.status === 'string') {
        filter.status = req.query.status;
      }
      if (req.query.employeeId && typeof req.query.employeeId === 'string') {
        filter.employeeId = req.query.employeeId;
      }

      const [records, total] = await Promise.all([
        PayrollRecord.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        PayrollRecord.countDocuments(filter)
      ]);

      return res.status(200).json({
        records,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /payroll/:id
 * Get a single payroll record by ID.
 * Verifies the record belongs to the current company.
 */
/**
 * POST /payroll/calculate/:employeeId
 * Calculates payroll for a single employee and month.
 */
router.post(
  '/calculate/:employeeId',
  authenticateToken,
  requireCompany,
  requireRole(['OWNER', 'ADMIN', 'ACCOUNTANT']),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { month } = req.body;
      if (!month || typeof month !== 'string') {
        return res.status(400).json({ message: 'Month is required (format YYYY-MM)' });
      }

      const payroll = await AccountingService.calculatePayroll(
        req.params.employeeId,
        month,
        req.user!.userId
      );

      return res.status(200).json({ success: true, payroll });
    } catch (err: any) {
      next(err);
    }
  }
);

/**
 * POST /payroll/generate-monthly
 * Runs the bulk monthly payroll/invoice run for the company.
 */
router.post(
  '/generate-monthly',
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
      const results = await AccountingService.generateMonthlyRun(
        companyId,
        month,
        req.user!.userId
      );

      return res.status(200).json({
        success: true,
        message: `Successfully processed payroll for ${month}`,
        results
      });
    } catch (err: any) {
      next(err);
    }
  }
);

/**
 * GET /payroll/:id
 * Get a single payroll record by ID, OR get all payroll records for a company if ID matches the company ID.
 */
router.get(
  '/:id',
  authenticateToken,
  requireCompany,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      const companyId = req.user!.currentCompanyId as string;
      const { id } = req.params;

      // 1. If it matches current company ID, it's fetching company payroll
      if (id === companyId) {
        const filter: any = { companyId: id };
        if (req.user!.role === 'EMPLOYEE') {
          const employee = await Employee.findOne({ companyId, email: req.user!.email });
          if (!employee) return res.status(200).json({ success: true, records: [] });
          filter.employeeId = employee._id;
        }

        const records = await Payroll.find(filter).populate('employeeId').sort({ createdAt: -1 });
        return res.status(200).json({ success: true, records });
      }

      // 2. Check if it's a new Payroll record by ID
      let record = await Payroll.findById(id).populate('employeeId');
      if (record) {
        if (record.companyId.toString() !== companyId) {
          return res.status(403).json({ message: 'Forbidden: Record does not belong to your company' });
        }
        if (req.user!.role === 'EMPLOYEE') {
          const employee = await Employee.findOne({ companyId, email: req.user!.email });
          if (!employee || record.employeeId.toString() !== employee._id.toString()) {
            return res.status(403).json({ message: 'Forbidden: Access denied' });
          }
        }
        return res.status(200).json(record);
      }

      // 3. Fallback: try checking if it's an old PayrollRecord by ID
      const oldRecord = await PayrollRecord.findById(id);
      if (oldRecord) {
        if (oldRecord.companyId.toString() !== companyId) {
          return res.status(403).json({ message: 'Forbidden: Record does not belong to your company' });
        }
        return res.status(200).json(oldRecord);
      }

      return res.status(404).json({ message: 'Payroll record or company not found' });
    } catch (err) {
      next(err);
    }
  }
);


/**
 * PATCH /payroll/:id/status
 * Update the status of a payroll record.
 * Restricted to OWNER and ADMIN roles.
 *
 * Valid transitions:
 *   PENDING   -> PROCESSED
 *   PROCESSED -> PAID
 *
 * Body:
 *   - status (string, required): The new status value
 */
router.patch(
  '/:id/status',
  authenticateToken,
  requireCompany,
  requireRole(['OWNER', 'ADMIN']),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      const companyId = req.user!.currentCompanyId as string;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ message: 'Status is required' });
      }

      const record = await PayrollRecord.findById(req.params.id);

      if (!record) {
        return res.status(404).json({ message: 'Payroll record not found' });
      }

      if (record.companyId.toString() !== companyId) {
        return res.status(403).json({ message: 'Forbidden: Record does not belong to your company' });
      }

      // Validate status transitions
      const validTransitions: Record<string, string> = {
        PENDING: 'PROCESSED',
        PROCESSED: 'PAID'
      };

      if (validTransitions[record.status] !== status) {
        return res.status(400).json({
          message: `Invalid status transition: ${record.status} -> ${status}. Allowed: ${record.status} -> ${validTransitions[record.status] || 'none (terminal state)'}`
        });
      }

      record.status = status;

      // Set paidAt timestamp when marking as PAID
      if (status === 'PAID') {
        record.paidAt = new Date();
      }

      await record.save();

      // Log activity when payroll is marked as PAID
      if (status === 'PAID') {
        await ActivityLog.create({
          companyId,
          userId: req.user!.userId,
          action: 'PAYROLL_PAID',
          description: `Payroll record for ${record.employeeName} (${record.period}) marked as PAID`,
          metadata: {
            payrollRecordId: record._id,
            employeeId: record.employeeId,
            period: record.period,
            netPay: record.netPay
          }
        });
      }

      return res.status(200).json(record);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
