import { Router, Response, NextFunction } from 'express';
import { authenticateToken, requireCompany, requireRole, AuthRequest } from '../middleware/auth';
import { Employee, EmployeeProfile, ActivityLog } from '../models';

const router = Router();

/**
 * POST /employee/add
 * Adds a new employee record and initializes their corresponding financial profile.
 */
router.post(
  '/add',
  authenticateToken,
  requireCompany,
  requireRole(['OWNER', 'ADMIN', 'ACCOUNTANT']),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { name, email, phone, designation, department, salary, currency = 'USD' } = req.body;

      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ message: 'Employee name is required' });
      }
      if (!email || typeof email !== 'string' || !email.trim()) {
        return res.status(400).json({ message: 'Employee email is required' });
      }
      if (salary === undefined || salary === null || typeof salary !== 'number' || salary < 0) {
        return res.status(400).json({ message: 'A valid salary is required' });
      }

      const companyId = req.user!.currentCompanyId as string;
      const cleanEmail = email.trim().toLowerCase();

      // Check if employee with the email already exists in this company
      const existing = await Employee.findOne({ companyId, email: cleanEmail });
      if (existing) {
        return res.status(409).json({ message: 'An employee with this email already exists in this company' });
      }

      const employee = await Employee.create({
        companyId,
        name: name.trim(),
        email: cleanEmail,
        phone,
        designation,
        department,
        salary,
        status: 'ACTIVE'
      });

      // Create EmployeeProfile
      const profile = await EmployeeProfile.create({
        employeeId: employee._id,
        companyId,
        baseSalary: salary,
        currency,
        bonusThisMonth: 0,
        deductionThisMonth: 0,
        allowances: [],
        taxRules: []
      });

      // Log activity
      await ActivityLog.create({
        companyId,
        userId: req.user!.userId,
        action: 'EMPLOYEE_ADDED',
        description: `Employee "${employee.name}" (${employee.email}) was added`,
        metadata: { employeeId: employee._id }
      });

      return res.status(201).json({ success: true, employee, profile });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PUT /employee/:id/profile
 * Updates the financial profile (salary, allowances, tax rules) for an employee.
 */
router.put(
  '/:id/profile',
  authenticateToken,
  requireCompany,
  requireRole(['OWNER', 'ADMIN', 'ACCOUNTANT']),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { baseSalary, currency, bonusThisMonth, deductionThisMonth, allowances, taxRules } = req.body;

      // Find or create profile
      let profile = await EmployeeProfile.findOne({ employeeId: req.params.id });
      if (!profile) {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
          return res.status(404).json({ message: 'Employee not found' });
        }
        profile = new EmployeeProfile({
          employeeId: employee._id,
          companyId: employee.companyId
        });
      }

      if (baseSalary !== undefined) profile.baseSalary = baseSalary;
      if (currency !== undefined) profile.currency = currency;
      if (bonusThisMonth !== undefined) profile.bonusThisMonth = bonusThisMonth;
      if (deductionThisMonth !== undefined) profile.deductionThisMonth = deductionThisMonth;
      if (allowances !== undefined) profile.allowances = allowances;
      if (taxRules !== undefined) profile.taxRules = taxRules;

      await profile.save();

      // Keep the salary field in basic Employee record synced
      await Employee.findByIdAndUpdate(req.params.id, { salary: profile.baseSalary });

      return res.status(200).json({ success: true, profile });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /employee/me
 * Retrieves the currently logged-in employee and their financial profile details.
 */
router.get(
  '/me',
  authenticateToken,
  requireCompany,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      const companyId = req.user!.currentCompanyId as string;
      const email = req.user!.email.toLowerCase();

      const employee = await Employee.findOne({ email, companyId });
      if (!employee) {
        return res.status(404).json({ message: 'Employee record not found for this user' });
      }

      let profile = await EmployeeProfile.findOne({ employeeId: employee._id });
      if (!profile) {
        profile = await EmployeeProfile.create({
          employeeId: employee._id,
          companyId,
          baseSalary: employee.salary || 0,
          currency: 'USD',
          bonusThisMonth: 0,
          deductionThisMonth: 0,
          allowances: [],
          taxRules: []
        });
      }

      return res.status(200).json({ success: true, employee, profile });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /employee/:id
 * Retrieves a single employee by ID and their financial profile details.
 */
router.get(
  '/:id',
  authenticateToken,
  requireCompany,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      const companyId = req.user!.currentCompanyId as string;
      const employee = await Employee.findOne({ _id: req.params.id, companyId });
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      let profile = await EmployeeProfile.findOne({ employeeId: employee._id });
      if (!profile) {
        profile = await EmployeeProfile.create({
          employeeId: employee._id,
          companyId,
          baseSalary: employee.salary || 0,
          currency: 'USD',
          bonusThisMonth: 0,
          deductionThisMonth: 0,
          allowances: [],
          taxRules: []
        });
      }

      return res.status(200).json({ success: true, employee, profile });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
