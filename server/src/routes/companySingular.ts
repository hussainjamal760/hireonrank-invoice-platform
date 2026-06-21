import { Router, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, Company, UserCompany, Employee } from '../models';
import { authenticateToken, requireCompany, AuthRequest } from '../middleware/auth';

const router = Router();

const getJwtSecret = () => process.env.JWT_SECRET || 'fallback_secret';

const generateToken = (userId: string, email: string, currentCompanyId: string | null, role: string | null): string => {
  return jwt.sign(
    { userId, email, currentCompanyId, role },
    getJwtSecret(),
    { expiresIn: '7d' }
  );
};

/**
 * POST /company/create
 * Creates a company. Creator automatically becomes the ACCOUNTANT.
 */
router.post('/create', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { name, logo } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'Company name is required' });
    }

    const company = await Company.create({
      name: name.trim(),
      logo: logo || '',
      ownerId: req.user!.userId
    });

    // Company creator becomes ACCOUNTANT automatically
    await UserCompany.create({
      userId: req.user!.userId,
      companyId: company._id,
      role: 'ACCOUNTANT'
    });

    const token = generateToken(
      req.user!.userId,
      req.user!.email,
      company._id.toString(),
      'ACCOUNTANT'
    );

    return res.status(201).json({
      success: true,
      token,
      company: {
        id: company._id,
        name: company.name,
        logo: company.logo
      },
      role: 'ACCOUNTANT'
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /company/employees
 * Fetches all employees of the current company context.
 */
router.get('/employees', authenticateToken, requireCompany, async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const companyId = req.user!.currentCompanyId as string;
    const { EmployeeProfile } = await import('../models');
    
    const employees = await Employee.find({ companyId, status: 'ACTIVE' }).lean();
    const profiles = await EmployeeProfile.find({ companyId }).lean();
    
    const employeesWithCurrency = employees.map(emp => {
      const profile = profiles.find(p => p.employeeId.toString() === emp._id.toString());
      return {
        ...emp,
        currency: profile ? profile.currency : 'USD'
      };
    });

    return res.status(200).json({ success: true, employees: employeesWithCurrency });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /company/:id
 * Fetches company details by ID.
 */
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Verify membership
    const membership = await UserCompany.findOne({
      userId: req.user!.userId,
      companyId: company._id
    });

    if (!membership) {
      return res.status(403).json({ message: 'Forbidden: Access denied to this company' });
    }

    return res.status(200).json({ success: true, company });
  } catch (err) {
    next(err);
  }
});

export default router;
