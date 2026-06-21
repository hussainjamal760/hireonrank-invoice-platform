import { Employee, EmployeeProfile, Payroll, PayrollInvoice, ActivityLog } from '../models';
import mongoose from 'mongoose';

export class AccountingService {
  /**
   * Calculates the payroll for a single employee for a specific month.
   * Business Logic: netSalary = baseSalary + totalAllowances - totalTax
   */
  static async calculatePayroll(employeeId: string, month: string, generatedBy: string) {
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Find or create employee financial profile
    let profile = await EmployeeProfile.findOne({ employeeId: employee._id });
    if (!profile) {
      profile = await EmployeeProfile.create({
        employeeId: employee._id,
        companyId: employee.companyId,
        baseSalary: employee.salary || 0,
        currency: 'USD',
        allowances: [],
        taxRules: []
      });
    }

    const baseSalary = profile.baseSalary;
    const totalAllowances = profile.allowances.reduce((sum, allow) => sum + allow.amount, 0);
    
    // Tax rules rate are stored as percentages, e.g. 10 for 10%
    const totalTax = profile.taxRules.reduce((sum, tax) => sum + (baseSalary * (tax.rate / 100)), 0);
    const netSalary = Math.max(0, baseSalary + totalAllowances - totalTax);

    // Save or update the payroll record
    const payroll = await Payroll.findOneAndUpdate(
      { companyId: employee.companyId, employeeId: employee._id, month },
      {
        baseSalary,
        totalAllowances,
        totalTax,
        netSalary,
        generatedBy: new mongoose.Types.ObjectId(generatedBy)
      },
      { upsert: true, returnDocument: 'after', runValidators: true }
    );

    return payroll;
  }

  /**
   * Bulk runs payroll calculations and invoice generation for all active employees of a company.
   */
  static async generateMonthlyRun(companyId: string, month: string, generatedBy: string) {
    const employees = await Employee.find({ companyId, status: 'ACTIVE' });
    if (employees.length === 0) {
      throw new Error('No active employees found for this company');
    }

    const company = await Company.findById(companyId);
    const companyName = company ? company.name : 'Our Company';

    const formatMonthToPeriod = (monthStr: string) => {
      const parts = monthStr.split('-');
      if (parts.length === 2) {
        const year = parts[0];
        const monthVal = parseInt(parts[1], 10);
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        if (monthVal >= 1 && monthVal <= 12) {
          return `${months[monthVal - 1]} ${year}`;
        }
      }
      return monthStr;
    };

    const results = [];
    for (const employee of employees) {
      try {
        // 1. Calculate payroll
        const payroll = await this.calculatePayroll(employee._id.toString(), month, generatedBy);

        // 2. Generate sequential invoice number
        const invoiceNumber = await this.generateInvoiceNumber(companyId, month);

        // 3. Generate invoice record per employee automatically
        const invoice = await PayrollInvoice.findOneAndUpdate(
          { companyId, employeeId: employee._id, month },
          {
            invoiceNumber,
            amount: payroll.netSalary,
            status: 'generated'
          },
          { upsert: true, returnDocument: 'after', runValidators: true }
        );

        results.push({
          employeeId: employee._id,
          employeeName: employee.name,
          payrollId: payroll._id,
          invoiceId: invoice._id,
          netSalary: payroll.netSalary,
          invoiceNumber
        });

        // Send notification email immediately
        try {
          const { sendPayrollEmail } = await import('../utils/email');
          const profile = await EmployeeProfile.findOne({ employeeId: employee._id });
          const currency = profile ? profile.currency : 'USD';
          const period = formatMonthToPeriod(month);

          await sendPayrollEmail(
            employee.email,
            employee.name,
            period,
            payroll.netSalary,
            currency,
            companyName
          );
        } catch (emailErr) {
          console.error(`Failed to send payroll email to ${employee.email}:`, emailErr);
        }
      } catch (err: any) {
        console.error(`Failed to process payroll run for employee ${employee._id}:`, err);
      }
    }

    // Log this activity
    await ActivityLog.create({
      companyId: new mongoose.Types.ObjectId(companyId),
      userId: new mongoose.Types.ObjectId(generatedBy),
      action: 'PAYROLL_GENERATED',
      description: `Executed bulk monthly run for "${month}" — generated ${results.length} invoices`,
      metadata: { month, processedCount: results.length }
    });

    return results;
  }

  /**
   * Generates a sequential invoice number for a company for a month run
   */
  private static async generateInvoiceNumber(companyId: string, month: string): Promise<string> {
    const cleanMonth = month.replace(/[^0-9]/g, ''); // e.g. "2026-06" -> "202606"
    const prefix = `INV-${cleanMonth || 'RUN'}`;

    const count = await PayrollInvoice.countDocuments({
      companyId,
      invoiceNumber: new RegExp(`^${prefix}-`)
    });

    const seq = String(count + 1).padStart(4, '0');
    return `${prefix}-${seq}`;
  }
}
