import { Router, Request, Response, NextFunction } from 'express';
import { Employee, PayrollRecord, ActivityLog, Company, Payroll, PayrollInvoice } from '../models';
import { authenticateToken, requireCompany, requireRole, AuthRequest } from '../middleware/auth';
import { AccountingService } from '../services/accountingService';
import { generateSalarySlipPDF } from '../utils/pdfGenerator';
import mongoose from 'mongoose';

const router = Router();

/**
 * Helper to fetch, map, and merge legacy and modern payroll records.
 */
const getMergedPayroll = async (
  companyId: string,
  userEmail?: string,
  employeeIdFilter?: string,
  periodFilter?: string,
  statusFilter?: string
) => {
  // 1. Resolve employee if email filter is provided
  let employee = null;
  if (userEmail) {
    employee = await Employee.findOne({ companyId, email: userEmail });
  }

  // 2. Build legacy filter
  const legacyFilter: any = { companyId };
  if (userEmail) {
    legacyFilter.employeeEmail = userEmail;
  } else if (employeeIdFilter) {
    legacyFilter.employeeId = employeeIdFilter;
  }
  if (periodFilter) legacyFilter.period = periodFilter;

  // 3. Build modern filter
  const modernFilter: any = { companyId };
  if (userEmail) {
    if (employee) {
      modernFilter.employeeId = employee._id;
    } else {
      return []; // Return empty if no matching employee profile exists
    }
  } else if (employeeIdFilter) {
    modernFilter.employeeId = employeeIdFilter;
  }
  if (periodFilter) modernFilter.month = periodFilter;

  // 4. Fetch legacy and modern records
  const [legacyRecords, modernRecords] = await Promise.all([
    PayrollRecord.find(legacyFilter).populate('employeeId').sort({ createdAt: -1 }),
    Payroll.find(modernFilter).populate('employeeId').sort({ createdAt: -1 })
  ]);

  // 5. Map modern records
  const mappedModern = await Promise.all(
    modernRecords.map(async (record: any) => {
      const pInv = await PayrollInvoice.findOne({
        companyId: record.companyId,
        employeeId: record.employeeId._id,
        month: record.month
      });

      const rawStatus = pInv ? pInv.status.toUpperCase() : 'PENDING';
      const status = rawStatus === 'GENERATED' ? 'PROCESSED' : rawStatus;

      return {
        _id: pInv ? pInv._id : record._id,
        employeeId: record.employeeId,
        employeeName: record.employeeId.name,
        employeeEmail: record.employeeId.email,
        period: record.month,
        baseSalary: record.baseSalary,
        deductions: record.totalTax,
        bonuses: record.totalAllowances,
        netPay: record.netSalary,
        status: status,
        createdAt: record.createdAt
      };
    })
  );

  // 6. Map legacy records
  const mappedLegacy = legacyRecords.map((record: any) => ({
    _id: record._id,
    employeeId: record.employeeId,
    employeeName: record.employeeName,
    employeeEmail: record.employeeEmail,
    period: record.period,
    baseSalary: record.baseSalary,
    deductions: record.deductions,
    bonuses: record.bonuses,
    netPay: record.netPay,
    status: record.status.toUpperCase(),
    createdAt: record.createdAt
  }));

  // 7. Combine, filter by status, and sort by date
  let combined = [...mappedLegacy, ...mappedModern];

  if (statusFilter) {
    const filterUpper = statusFilter.toUpperCase();
    combined = combined.filter((r) => r.status === filterUpper);
  }

  combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return combined;
};

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
      const { id } = req.params;

      let recordType: 'new' | 'old' | null = null;
      let record: any = null;

      // 1. Try if ID belongs to a PayrollInvoice
      const { PayrollInvoice, Payroll } = await import('../models');
      const pInv = await PayrollInvoice.findOne({ _id: id, companyId });
      if (pInv) {
        record = await Payroll.findOne({ companyId, employeeId: pInv.employeeId, month: pInv.month }).populate('employeeId');
        if (record) {
          recordType = 'new';
        } else {
          record = await PayrollRecord.findOne({ companyId, employeeId: pInv.employeeId, period: pInv.month });
          if (record) recordType = 'old';
        }
      } else {
        // 2. Fallback to direct ID match
        record = await Payroll.findOne({ _id: id, companyId }).populate('employeeId');
        if (record) {
          recordType = 'new';
        } else {
          record = await PayrollRecord.findOne({ _id: id, companyId });
          if (record) recordType = 'old';
        }
      }

      if (!record) {
        return res.status(404).json({ message: 'Payroll record not found' });
      }

      // Security
      if (req.user!.role === 'EMPLOYEE') {
        const employee = await Employee.findOne({ companyId, email: req.user!.email });
        if (!employee) return res.status(403).json({ message: 'Forbidden' });
        
        if (recordType === 'new') {
          if (record.employeeId._id.toString() !== employee._id.toString()) {
            return res.status(403).json({ message: 'Forbidden' });
          }
        } else {
          if (record.employeeEmail !== req.user!.email) {
            return res.status(403).json({ message: 'Forbidden' });
          }
        }
      }

      const company = await Company.findById(companyId);
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }

      const pdfData = recordType === 'new' ? {
        period: record.month,
        employeeName: record.employeeId.name,
        employeeEmail: record.employeeId.email,
        baseSalary: record.baseSalary,
        bonuses: record.totalAllowances,
        deductions: record.totalTax,
        netPay: record.netSalary
      } : {
        period: record.period,
        employeeName: record.employeeName,
        employeeEmail: record.employeeEmail,
        baseSalary: record.baseSalary,
        bonuses: record.bonuses,
        deductions: record.deductions,
        netPay: record.netPay
      };

      const pdfBuffer = await generateSalarySlipPDF(pdfData, company);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=SalarySlip_${pdfData.period.replace(/\s+/g, '_')}.pdf`);
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

      const allRecords = await getMergedPayroll(
        companyId,
        req.user!.role === 'EMPLOYEE' ? req.user!.email : undefined,
        req.query.employeeId as string,
        req.query.period as string,
        req.query.status as string
      );

      const paginatedRecords = allRecords.slice(skip, skip + limit);
      const total = allRecords.length;

      return res.status(200).json({
        records: paginatedRecords,
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
        req.params.employeeId as string,
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

      // 1. If it matches current company ID, it's fetching company payroll list
      if (id === companyId) {
        const records = await getMergedPayroll(
          id,
          req.user!.role === 'EMPLOYEE' ? req.user!.email : undefined
        );
        return res.status(200).json({ success: true, records });
      }

      // 2. Check if it's a new Payroll record by ID or a PayrollInvoice ID
      let record = await Payroll.findById(id).populate('employeeId');
      if (!record) {
        const pInv = await PayrollInvoice.findById(id);
        if (pInv) {
          record = await Payroll.findOne({ companyId, employeeId: pInv.employeeId, month: pInv.month }).populate('employeeId');
        }
      }

      if (record) {
        if (record.companyId.toString() !== companyId) {
          return res.status(403).json({ message: 'Forbidden: Record does not belong to your company' });
        }
        if (req.user!.role === 'EMPLOYEE') {
          const employee = await Employee.findOne({ companyId, email: req.user!.email });
          if (!employee || (record.employeeId as any)._id.toString() !== employee._id.toString()) {
            return res.status(403).json({ message: 'Forbidden: Access denied' });
          }
        }
        
        const pInv = await PayrollInvoice.findOne({ companyId, employeeId: (record.employeeId as any)._id, month: record.month });
        const rawStatus = pInv ? pInv.status.toUpperCase() : 'PENDING';
        const status = rawStatus === 'GENERATED' ? 'PROCESSED' : rawStatus;

        return res.status(200).json({
          _id: pInv ? pInv._id : record._id,
          employeeId: record.employeeId,
          employeeName: (record.employeeId as any).name,
          employeeEmail: (record.employeeId as any).email,
          period: record.month,
          baseSalary: record.baseSalary,
          deductions: record.totalTax,
          bonuses: record.totalAllowances,
          netPay: record.netSalary,
          status: status,
          createdAt: record.createdAt
        });
      }

      // 3. Fallback: try checking if it's an old PayrollRecord by ID
      const oldRecord = await PayrollRecord.findById(id).populate('employeeId');
      if (oldRecord) {
        if (oldRecord.companyId.toString() !== companyId) {
          return res.status(403).json({ message: 'Forbidden: Record does not belong to your company' });
        }
        if (req.user!.role === 'EMPLOYEE' && oldRecord.employeeEmail !== req.user!.email) {
          return res.status(403).json({ message: 'Forbidden: Access denied' });
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
