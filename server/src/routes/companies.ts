import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, Company, UserCompany, Invitation } from '../models';
import { authenticateToken, requireCompany, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Helper to generate a new JWT token
const generateToken = (userId: string, email: string, currentCompanyId: string | null, role: string | null): string => {
  return jwt.sign(
    { userId, email, currentCompanyId, role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * GET /companies/my
 * Returns a list of companies the user is associated with.
 */
router.get('/my', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const memberships = await UserCompany.find({ userId: req.user.userId }).populate('companyId');
    return res.status(200).json({
      companies: memberships.map((m: any) => ({
        id: m.companyId._id,
        name: m.companyId.name,
        logo: m.companyId.logo,
        role: m.role
      }))
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /companies/select
 * Request: { companyId }
 * Selects a company and issues a new dashboard JWT token.
 */
router.post('/select', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { companyId } = req.body;
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }

    const membership = await UserCompany.findOne({
      userId: req.user.userId,
      companyId
    }).populate('companyId');

    if (!membership) {
      return res.status(403).json({ message: 'You do not belong to this company' });
    }

    const company = membership.companyId as any;
    const token = generateToken(
      req.user.userId,
      req.user.email,
      company._id.toString(),
      membership.role
    );

    return res.status(200).json({
      success: true,
      token,
      companyId: company._id,
      role: membership.role,
      company: {
        id: company._id,
        name: company.name,
        logo: company.logo
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /companies
 * Request: { name, logo }
 * Creates a new company and registers the user as OWNER.
 */
router.post('/', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { name, logo } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ message: 'Company name is required' });
    }

    // 1. Create the Company
    const company = await Company.create({
      name: name.trim(),
      logo: logo || '',
      ownerId: req.user.userId
    });

    // 2. Link User with Company as OWNER
    await UserCompany.create({
      userId: req.user.userId,
      companyId: company._id,
      role: 'OWNER'
    });

    // 3. Issue new JWT token with company context
    const token = generateToken(
      req.user.userId,
      req.user.email,
      company._id.toString(),
      'OWNER'
    );

    return res.status(201).json({
      success: true,
      token,
      company: {
        id: company._id,
        name: company.name,
        logo: company.logo
      },
      role: 'OWNER'
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /companies/invite
 * Request: { email, role }
 * Protected: Requires OWNER or ADMIN role inside selected company
 */
router.post(
  '/invite',
  authenticateToken,
  requireCompany,
  requireRole(['OWNER', 'ADMIN']),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.user || !req.user.currentCompanyId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { email, role } = req.body;
      if (!email || !role) {
        return res.status(400).json({ message: 'Email and role are required' });
      }

      const cleanEmail = email.trim().toLowerCase();

      if (!['OWNER', 'ADMIN', 'EMPLOYEE', 'ACCOUNTANT'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }

      // Check if user is already in the company
      const existingUser = await User.findOne({ email: cleanEmail });
      if (existingUser) {
        const membership = await UserCompany.findOne({
          userId: existingUser._id,
          companyId: req.user.currentCompanyId
        });
        if (membership) {
          return res.status(400).json({ message: 'User is already a member of this company' });
        }
      }

      // Generate a unique token
      const token = crypto.randomBytes(32).toString('hex');

      // Create or update invitation
      await Invitation.findOneAndUpdate(
        { companyId: req.user.currentCompanyId, email: cleanEmail },
        { role, token, status: 'PENDING', createdAt: new Date() },
        { upsert: true, new: true }
      );

      console.log(`\n==========================================`);
      console.log(`[INVITATION SERVICE] Invited ${cleanEmail} to company ${req.user.currentCompanyId}`);
      console.log(`Invitation Token: ${token}`);
      console.log(`Join Link: http://localhost:3000/create-company?invite_token=${token}`);
      console.log(`==========================================\n`);

      return res.status(200).json({
        success: true,
        message: 'Invitation sent successfully',
        token // Exposing token for dev testing
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /companies/join
 * Request: { token }
 * Joins a company via a pending invitation.
 */
router.post('/join', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Invitation token is required' });
    }

    const invitation = await Invitation.findOne({ token, status: 'PENDING' });
    if (!invitation) {
      return res.status(400).json({ message: 'Invalid, used, or expired invitation token' });
    }

    if (invitation.email !== req.user.email) {
      return res.status(400).json({ 
        message: `This invitation was sent to ${invitation.email}, but you are signed in as ${req.user.email}` 
      });
    }

    // Accept invitation
    invitation.status = 'ACCEPTED';
    await invitation.save();

    // Check if membership already exists (failsafe)
    let membership = await UserCompany.findOne({
      userId: req.user.userId,
      companyId: invitation.companyId
    });

    if (!membership) {
      membership = await UserCompany.create({
        userId: req.user.userId,
        companyId: invitation.companyId,
        role: invitation.role
      });
    }

    // Retrieve company details
    const company = await Company.findById(invitation.companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Issue JWT with new company context
    const newToken = generateToken(
      req.user.userId,
      req.user.email,
      company._id.toString(),
      invitation.role
    );

    return res.status(200).json({
      success: true,
      token: newToken,
      companyId: company._id,
      role: invitation.role,
      company: {
        id: company._id,
        name: company.name,
        logo: company.logo
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
