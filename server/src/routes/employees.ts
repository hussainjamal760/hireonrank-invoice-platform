import { Router, Request, Response, NextFunction } from 'express';
import { Employee, ActivityLog } from '../models';
import { authenticateToken, requireCompany, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * POST /employees
 * Creates a new employee record within the current company.
 * Restricted to OWNER and ADMIN roles.
 */
router.post(
  '/',
  authenticateToken,
  requireCompany,
  requireRole(['OWNER', 'ADMIN']),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.user || !req.user.currentCompanyId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { name, email, phone, designation, department, salary, bankDetails, joinDate } = req.body;

      // Validate required fields
      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ message: 'Employee name is required' });
      }
      if (!email || typeof email !== 'string' || !email.trim()) {
        return res.status(400).json({ message: 'Employee email is required' });
      }
      if (salary === undefined || salary === null || typeof salary !== 'number' || salary < 0) {
        return res.status(400).json({ message: 'A valid salary is required' });
      }

      const cleanEmail = email.trim().toLowerCase();

      // Check for duplicate email within the same company
      const existingEmployee = await Employee.findOne({
        companyId: req.user.currentCompanyId,
        email: cleanEmail
      });

      if (existingEmployee) {
        return res.status(409).json({ message: 'An employee with this email already exists in this company' });
      }

      // Create employee
      const employee = await Employee.create({
        companyId: req.user.currentCompanyId,
        name: name.trim(),
        email: cleanEmail,
        phone: phone || undefined,
        designation: designation || undefined,
        department: department || undefined,
        salary,
        bankDetails: bankDetails || undefined,
        joinDate: joinDate ? new Date(joinDate) : new Date(),
        status: 'ACTIVE'
      });

      // Log activity
      await ActivityLog.create({
        companyId: req.user.currentCompanyId,
        userId: req.user.userId,
        action: 'EMPLOYEE_ADDED',
        description: `Employee "${employee.name}" (${employee.email}) was added`,
        metadata: { employeeId: employee._id }
      });

      return res.status(201).json({ success: true, employee });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /employees
 * Lists employees for the current company with pagination, search, and filters.
 * Accessible by all authenticated company members.
 */
router.get(
  '/',
  authenticateToken,
  requireCompany,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.user || !req.user.currentCompanyId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
      const search = (req.query.search as string || '').trim();
      const status = req.query.status as string;
      const department = req.query.department as string;

      // Build query filter
      const filter: Record<string, any> = { companyId: req.user.currentCompanyId };

      if (status && ['ACTIVE', 'INACTIVE'].includes(status.toUpperCase())) {
        filter.status = status.toUpperCase();
      }

      if (department) {
        filter.department = department;
      }

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (page - 1) * limit;

      const [employees, total] = await Promise.all([
        Employee.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Employee.countDocuments(filter)
      ]);

      return res.status(200).json({
        employees,
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
 * GET /employees/:id
 * Retrieves a single employee by ID.
 * Verifies the employee belongs to the current company.
 */
router.get(
  '/:id',
  authenticateToken,
  requireCompany,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.user || !req.user.currentCompanyId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const employee = await Employee.findOne({
        _id: req.params.id,
        companyId: req.user.currentCompanyId
      });

      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      return res.status(200).json({ employee });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PUT /employees/:id
 * Updates an existing employee.
 * Restricted to OWNER and ADMIN roles.
 */
router.put(
  '/:id',
  authenticateToken,
  requireCompany,
  requireRole(['OWNER', 'ADMIN']),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.user || !req.user.currentCompanyId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Verify employee belongs to this company
      const employee = await Employee.findOne({
        _id: req.params.id,
        companyId: req.user.currentCompanyId
      });

      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      // Whitelist of allowed update fields
      const allowedFields = ['name', 'email', 'phone', 'designation', 'department', 'salary', 'bankDetails', 'status'];
      const updates: Record<string, any> = {};

      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      }

      // Normalize email if being updated
      if (updates.email) {
        updates.email = updates.email.trim().toLowerCase();

        // Check for duplicate email within the company (excluding current employee)
        const duplicate = await Employee.findOne({
          companyId: req.user.currentCompanyId,
          email: updates.email,
          _id: { $ne: employee._id }
        });

        if (duplicate) {
          return res.status(409).json({ message: 'Another employee with this email already exists in this company' });
        }
      }

      const updatedEmployee = await Employee.findByIdAndUpdate(
        employee._id,
        { $set: updates },
        { new: true, runValidators: true }
      );

      // Log activity
      await ActivityLog.create({
        companyId: req.user.currentCompanyId,
        userId: req.user.userId,
        action: 'EMPLOYEE_UPDATED',
        description: `Employee "${updatedEmployee?.name}" (${updatedEmployee?.email}) was updated`,
        metadata: { employeeId: employee._id, updatedFields: Object.keys(updates) }
      });

      return res.status(200).json({ success: true, employee: updatedEmployee });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * DELETE /employees/:id
 * Soft-deletes an employee by setting their status to INACTIVE.
 * Restricted to OWNER and ADMIN roles.
 */
router.delete(
  '/:id',
  authenticateToken,
  requireCompany,
  requireRole(['OWNER', 'ADMIN']),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.user || !req.user.currentCompanyId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Verify employee belongs to this company
      const employee = await Employee.findOne({
        _id: req.params.id,
        companyId: req.user.currentCompanyId
      });

      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      if (employee.status === 'INACTIVE') {
        return res.status(400).json({ message: 'Employee is already inactive' });
      }

      employee.status = 'INACTIVE';
      await employee.save();

      // Log activity
      await ActivityLog.create({
        companyId: req.user.currentCompanyId,
        userId: req.user.userId,
        action: 'EMPLOYEE_REMOVED',
        description: `Employee "${employee.name}" (${employee.email}) was deactivated`,
        metadata: { employeeId: employee._id }
      });

      return res.status(200).json({ success: true, message: 'Employee deactivated successfully' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
