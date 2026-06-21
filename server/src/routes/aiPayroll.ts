import { Router, Response, NextFunction } from 'express';
import { authenticateToken, requireCompany, requireRole, AuthRequest } from '../middleware/auth';
import { Employee, EmployeeProfile, Company, Payroll, PayrollInvoice, PayrollRecord, ActivityLog } from '../models';
import { parsePayrollText } from '../services/aiPayrollService';
import { sendPayrollEmail } from '../utils/email';
import mongoose from 'mongoose';

const router = Router();

/**
 * Helper to normalize period inputs (e.g. "2026-06" <-> "June 2026")
 */
function parsePeriod(periodStr: string) {
  if (!periodStr) {
    const now = new Date();
    const year = now.getFullYear();
    const monthNum = String(now.getMonth() + 1).padStart(2, '0');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return {
      month: `${year}-${monthNum}`,
      period: `${monthNames[now.getMonth()]} ${year}`
    };
  }

  // If format is YYYY-MM
  if (/^\d{4}-\d{2}$/.test(periodStr)) {
    const [year, month] = periodStr.split('-');
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthName = months[parseInt(month, 10) - 1] || 'Current';
    return {
      month: periodStr,
      period: `${monthName} ${year}`
    };
  }

  // If format is "Month Year", e.g. "June 2026"
  const parts = periodStr.trim().split(/\s+/);
  if (parts.length === 2) {
    const monthName = parts[0];
    const year = parts[1];
    const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    const monthIdx = months.indexOf(monthName.toLowerCase());
    if (monthIdx !== -1) {
      const monthNum = String(monthIdx + 1).padStart(2, '0');
      return {
        month: `${year}-${monthNum}`,
        period: `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`
      };
    }
  }

  // Fallback to what was passed or current
  return {
    month: periodStr,
    period: periodStr
  };
}

/**
 * Helper to generate sequential invoice numbers for monthly runs
 */
async function generateInvoiceNumber(companyId: string, month: string): Promise<string> {
  const cleanMonth = month.replace(/[^0-9]/g, ''); // e.g. "2026-06" -> "202606"
  const prefix = `INV-${cleanMonth || 'RUN'}`;

  const count = await PayrollInvoice.countDocuments({
    companyId,
    invoiceNumber: new RegExp(`^${prefix}-`)
  });

  const seq = String(count + 1).padStart(4, '0');
  return `${prefix}-${seq}`;
}

/**
 * POST /api/ai/payroll/generate
 * Generates structured payroll calculations from natural language.
 */
router.post(
  '/generate',
  authenticateToken,
  requireCompany,
  requireRole(['OWNER', 'ADMIN', 'ACCOUNTANT']),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      const companyId = req.user!.currentCompanyId as string;
      const { employeeId, text } = req.body;

      if (!employeeId) {
        return res.status(400).json({ message: 'employeeId is required' });
      }
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ message: 'text instruction is required' });
      }

      // 1. Fetch employee and verify they belong to this company (Database Rule: Never create/change employee)
      const employee = await Employee.findOne({ _id: employeeId, companyId });
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found in your company' });
      }

      // 2. Fetch company details
      const company = await Company.findById(companyId);
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }

      // 3. Fetch employee profile rules
      let profile = await EmployeeProfile.findOne({ employeeId: employee._id });
      if (!profile) {
        profile = await EmployeeProfile.create({
          employeeId: employee._id,
          companyId,
          baseSalary: employee.salary || 0,
          currency: 'USD',
          allowances: [],
          taxRules: []
        });
      }

      // 4. Call Groq service
      const parsedData = await parsePayrollText(text, employee, company, profile);

      return res.status(200).json({
        success: true,
        payroll: parsedData
      });
    } catch (err: any) {
      console.error('Error generating AI payroll:', err);
      return res.status(500).json({ message: err.message || 'Failed to generate AI payroll calculations' });
    }
  }
);

/**
 * POST /api/ai/payroll/save
 * Saves the finalized (possibly edited) AI-generated payroll calculations to the database.
 */
router.post(
  '/save',
  authenticateToken,
  requireCompany,
  requireRole(['OWNER', 'ADMIN', 'ACCOUNTANT']),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      const companyId = req.user!.currentCompanyId as string;
      const userId = req.user!.userId;
      const {
        employeeId,
        payPeriod,
        baseSalary,
        allowances,
        bonus,
        taxDeduction,
        otherDeductions,
        grossSalary,
        totalDeductions,
        netSalary
      } = req.body;

      if (!employeeId) {
        return res.status(400).json({ message: 'employeeId is required' });
      }
      if (!payPeriod) {
        return res.status(400).json({ message: 'payPeriod is required' });
      }

      // 1. Verify employee exists in the company
      const employee = await Employee.findOne({ _id: employeeId, companyId });
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found in your company' });
      }

      // 2. Perform Backend calculation validation (Step 7)
      const numericBase = Number(baseSalary) || 0;
      const numericBonus = Number(bonus) || 0;
      const allowancesList = Array.isArray(allowances) ? allowances : [];
      const allowancesSum = allowancesList.reduce((sum: number, a: any) => sum + (Number(a.amount) || 0), 0);

      const calculatedGross = numericBase + allowancesSum + numericBonus;
      const numericTax = Number(taxDeduction) || 0;
      const numericOther = Number(otherDeductions) || 0;
      const calculatedDeductions = numericTax + numericOther;
      const calculatedNet = Math.max(0, calculatedGross - calculatedDeductions);

      // We allow standard floating point precision tolerances of 0.05
      const tolerance = 0.05;
      if (Math.abs(Number(grossSalary) - calculatedGross) > tolerance) {
        return res.status(400).json({ message: `Calculations mismatch: expected gross salary to be ${calculatedGross}, but received ${grossSalary}` });
      }
      if (Math.abs(Number(totalDeductions) - calculatedDeductions) > tolerance) {
        return res.status(400).json({ message: `Calculations mismatch: expected total deductions to be ${calculatedDeductions}, but received ${totalDeductions}` });
      }
      if (Math.abs(Number(netSalary) - calculatedNet) > tolerance) {
        return res.status(400).json({ message: `Calculations mismatch: expected net salary to be ${calculatedNet}, but received ${netSalary}` });
      }

      // 3. Normalize periods
      const { month, period } = parsePeriod(payPeriod);

      // Check if duplicate record exists for (companyId, employeeId, period/month)
      const existingPayroll = await Payroll.findOne({ companyId, employeeId, month });
      const existingRecord = await PayrollRecord.findOne({ companyId, employeeId, period });

      if (existingPayroll || existingRecord) {
        return res.status(409).json({ message: `Payroll record already exists for employee ${employee.name} in period ${period}` });
      }

      // 4. Save to Payroll model (New System)
      const newPayroll = await Payroll.create({
        companyId,
        employeeId,
        month,
        baseSalary: numericBase,
        totalAllowances: allowancesSum + numericBonus,
        totalTax: calculatedDeductions,
        netSalary: calculatedNet,
        generatedBy: new mongoose.Types.ObjectId(userId)
      });

      // 5. Generate seq invoice number & save to PayrollInvoice model (New System)
      const invoiceNumber = await generateInvoiceNumber(companyId, month);
      const newInvoice = await PayrollInvoice.create({
        companyId,
        employeeId,
        invoiceNumber,
        month,
        amount: calculatedNet,
        status: 'generated'
      });

      // 6. Save to PayrollRecord model (Old System for backward compatibility)
      const newRecord = await PayrollRecord.create({
        companyId,
        employeeId,
        employeeName: employee.name,
        employeeEmail: employee.email,
        period,
        baseSalary: numericBase,
        deductions: calculatedDeductions,
        bonuses: allowancesSum + numericBonus,
        netPay: calculatedNet,
        status: 'PROCESSED',
        generatedBy: new mongoose.Types.ObjectId(userId)
      });

      // Send notification email to employee immediately
      try {
        const companyDoc = await Company.findById(companyId);
        const profileDoc = await EmployeeProfile.findOne({ employeeId });
        const currency = profileDoc ? profileDoc.currency : 'USD';
        const companyName = companyDoc ? companyDoc.name : 'Our Company';

        await sendPayrollEmail(
          employee.email,
          employee.name,
          period,
          calculatedNet,
          currency,
          companyName
        );
      } catch (emailErr) {
        console.error('Failed to send payroll email:', emailErr);
      }

      // 7. Log Activity
      await ActivityLog.create({
        companyId: new mongoose.Types.ObjectId(companyId),
        userId: new mongoose.Types.ObjectId(userId),
        action: 'PAYROLL_GENERATED',
        description: `AI-generated payroll for "${employee.name}" for period "${period}"`,
        metadata: {
          payrollId: newPayroll._id,
          payrollRecordId: newRecord._id,
          employeeId,
          period,
          netPay: calculatedNet
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Payroll generated and saved successfully',
        payroll: newPayroll,
        invoice: newInvoice,
        record: newRecord
      });
    } catch (err: any) {
      next(err);
    }
  }
);

export default router;
