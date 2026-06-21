import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, Company, UserCompany, Invitation, Employee } from '../models';
import { authenticateToken, requireCompany, requireRole, AuthRequest } from '../middleware/auth';
import cloudinary from '../utils/cloudinary';
import { sendInvitationEmail } from '../utils/email';

const router = Router();

const getJwtSecret = () => process.env.JWT_SECRET || 'fallback_secret';

const generateToken = (userId: string, email: string, currentCompanyId: string | null, role: string | null): string => {
  return jwt.sign(
    { userId, email, currentCompanyId, role },
    getJwtSecret(),
    { expiresIn: '7d' }
  );
};

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

router.get('/current', authenticateToken, requireCompany, async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    if (!req.user || !req.user.currentCompanyId) {
      return res.status(401).json({ message: 'Unauthorized or no active company' });
    }

    const company = await Company.findById(req.user.currentCompanyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    return res.status(200).json({
      success: true,
      company: {
        id: company._id,
        name: company.name,
        address: company.address,
        contactNumber: company.contactNumber,
        website: company.website,
        country: company.country,
        companyType: company.companyType,
        employeesCount: company.employeesCount,
        departments: company.departments,
        logo: company.logo
      }
    });
  } catch (err) {
    next(err);
  }
});

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

router.post('/', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { name, logo } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ message: 'Company name is required' });
    }

    const company = await Company.create({
      name: name.trim(),
      logo: logo || '',
      ownerId: req.user.userId
    });

    await UserCompany.create({
      userId: req.user.userId,
      companyId: company._id,
      role: 'OWNER'
    });

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

router.post(
  '/invite',
  authenticateToken,
  requireCompany,
  requireRole(['OWNER', 'ADMIN', 'ACCOUNTANT']),
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

      const existingInvitation = await Invitation.findOne({
        companyId: req.user.currentCompanyId,
        email: cleanEmail,
        status: 'PENDING'
      });
      if (existingInvitation) {
        return res.status(400).json({ message: 'An invitation has already been sent to this email' });
      }

      const token = crypto.randomBytes(32).toString('hex');

      await Invitation.findOneAndUpdate(
        { companyId: req.user.currentCompanyId, email: cleanEmail },
        { role, token, status: 'PENDING', createdAt: new Date() },
        { upsert: true, returnDocument: 'after' }
      );

      // Fetch company name to pass to email template
      const company = await Company.findById(req.user.currentCompanyId);
      const companyName = company ? company.name : 'Our Company';

      // Send the actual invitation email
      await sendInvitationEmail(cleanEmail, companyName, token, role);

      return res.status(200).json({
        success: true,
        message: 'Invitation sent successfully',
        token 
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/invite/batch',
  authenticateToken,
  requireCompany,
  requireRole(['OWNER', 'ADMIN', 'ACCOUNTANT']),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.user || !req.user.currentCompanyId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { emails, role } = req.body;
      if (!emails || !Array.isArray(emails) || !role) {
        return res.status(400).json({ message: 'Emails array and role are required' });
      }

      if (!['OWNER', 'ADMIN', 'EMPLOYEE', 'ACCOUNTANT'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }

      const company = await Company.findById(req.user.currentCompanyId);
      const companyName = company ? company.name : 'Our Company';

      const results = {
        successful: [] as string[],
        failed: [] as { email: string; reason: string }[]
      };

      await Promise.all(emails.map(async (email) => {
        const cleanEmail = email.trim().toLowerCase();
        try {
          const existingUser = await User.findOne({ email: cleanEmail });
          if (existingUser) {
            const membership = await UserCompany.findOne({
              userId: existingUser._id,
              companyId: req.user!.currentCompanyId
            });
            if (membership) {
              results.failed.push({ email: cleanEmail, reason: 'Already a member' });
              return;
            }
          }

          const existingInvitation = await Invitation.findOne({
            companyId: req.user!.currentCompanyId,
            email: cleanEmail,
            status: 'PENDING'
          });
          if (existingInvitation) {
            results.failed.push({ email: cleanEmail, reason: 'Invitation already sent' });
            return;
          }

          const token = crypto.randomBytes(32).toString('hex');

          await Invitation.findOneAndUpdate(
            { companyId: req.user!.currentCompanyId, email: cleanEmail },
            { role, token, status: 'PENDING', createdAt: new Date() },
            { upsert: true }
          );

          await sendInvitationEmail(cleanEmail, companyName, token, role);
          results.successful.push(cleanEmail);
        } catch (e: any) {
          results.failed.push({ email: cleanEmail, reason: e.message || 'Error processing invitation' });
        }
      }));

      return res.status(200).json({
        success: true,
        message: `Processed ${emails.length} invitations`,
        results
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/invite-info/:token', async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const invitation = await Invitation.findOne({ token, status: 'PENDING' });
    if (!invitation) {
      return res.status(404).json({ message: 'Invalid or expired invitation token' });
    }

    const company = await Company.findById(invitation.companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const userExists = await User.exists({ email: invitation.email.toLowerCase() });

    return res.status(200).json({
      success: true,
      email: invitation.email,
      userExists: !!userExists,
      company: {
        name: company.name,
        logo: company.logo,
        departments: company.departments || []
      }
    });
  } catch (err) {
    next(err);
  }
});

router.post('/join', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { token, department } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Invitation token is required' });
    }

    const invitation = await Invitation.findOne({ token });
    if (!invitation) {
      return res.status(400).json({ message: 'Invalid or expired invitation token' });
    }

    // Handle case where user already accepted and is clicking/refreshing the link again
    if (invitation.status === 'ACCEPTED') {
      if (invitation.email !== req.user.email) {
        return res.status(400).json({ message: 'Invitation has already been used by another account' });
      }

      const membership = await UserCompany.findOne({
        userId: req.user.userId,
        companyId: invitation.companyId
      });

      if (membership) {
        const company = await Company.findById(invitation.companyId);
        if (company) {
          const newToken = generateToken(
            req.user.userId,
            req.user.email,
            company._id.toString(),
            membership.role
          );

          return res.status(200).json({
            success: true,
            token: newToken,
            companyId: company._id,
            role: membership.role,
            company: {
              id: company._id,
              name: company.name,
              logo: company.logo
            }
          });
        }
      }
    }

    if (invitation.status !== 'PENDING') {
      return res.status(400).json({ message: 'Invitation is no longer active' });
    }

    if (invitation.email !== req.user.email) {
      return res.status(400).json({ 
        message: `This invitation was sent to ${invitation.email}, but you are signed in as ${req.user.email}` 
      });
    }

    invitation.status = 'ACCEPTED';
    await invitation.save();

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

    // Automatically add as an Employee record
    const userDoc = await User.findById(req.user.userId);
    let employeeRecord = await Employee.findOne({
      companyId: invitation.companyId,
      email: req.user.email
    });

    if (!employeeRecord) {
      await Employee.create({
        companyId: invitation.companyId,
        userId: req.user.userId,
        name: userDoc?.name || req.user.email.split('@')[0],
        email: req.user.email,
        phone: userDoc?.phoneNumber || undefined,
        salary: 0,
        designation: userDoc?.occupation || invitation.role,
        department: department || undefined,
        status: 'ACTIVE'
      });
    } else {
      employeeRecord.userId = req.user.userId as any;
      employeeRecord.name = userDoc?.name || employeeRecord.name;
      if (userDoc?.phoneNumber) employeeRecord.phone = userDoc.phoneNumber;
      if (department) employeeRecord.department = department;
      if (userDoc?.occupation) employeeRecord.designation = userDoc.occupation;
      await employeeRecord.save();
    }

    const company = await Company.findById(invitation.companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

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

router.post('/join-as-employee', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { token, name, age, occupation, phoneNumber, department } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Invitation token is required' });
    }
    if (!name || !age || !occupation || !phoneNumber) {
      return res.status(400).json({ message: 'All profile fields are required (name, age, occupation, phoneNumber)' });
    }

    const invitation = await Invitation.findOne({ token });
    if (!invitation) {
      return res.status(400).json({ message: 'Invalid or expired invitation token' });
    }

    if (invitation.status === 'ACCEPTED') {
      if (invitation.email !== req.user.email) {
        return res.status(400).json({ message: 'This invitation has already been used by another account' });
      }
      const existingMembership = await UserCompany.findOne({
        userId: req.user.userId,
        companyId: invitation.companyId
      });
      if (existingMembership) {
        const company = await Company.findById(invitation.companyId);
        if (company) {
          const newToken = generateToken(req.user.userId, req.user.email, company._id.toString(), existingMembership.role);
          return res.status(200).json({
            success: true,
            token: newToken,
            companyId: company._id,
            role: existingMembership.role,
            company: { id: company._id, name: company.name, logo: company.logo }
          });
        }
      }
    }

    if (invitation.status !== 'PENDING') {
      return res.status(400).json({ message: 'Invitation is no longer active' });
    }

    if (invitation.email !== req.user.email) {
      return res.status(400).json({
        message: `This invitation was sent to ${invitation.email}, but you are signed in as ${req.user.email}`
      });
    }

    // 1. Update user profile
    await User.findByIdAndUpdate(req.user.userId, {
      $set: { name, age: parseInt(age), occupation, phoneNumber }
    });

    // 2. Remove user from all existing companies
    const existingMemberships = await UserCompany.find({ userId: req.user.userId });
    for (const membership of existingMemberships) {
      if (membership.role === 'OWNER') {
        const ownerCount = await UserCompany.countDocuments({
          companyId: membership.companyId,
          role: 'OWNER'
        });
        if (ownerCount <= 1) {
          // Sole owner: delete the company and all related memberships
          await UserCompany.deleteMany({ companyId: membership.companyId });
          await Employee.deleteMany({ companyId: membership.companyId });
          await Company.findByIdAndDelete(membership.companyId);
          continue;
        }
      }
      await UserCompany.findByIdAndDelete(membership._id);
    }

    // Also remove any existing employee records for this user in other companies
    await Employee.deleteMany({ userId: req.user.userId });

    // 3. Mark invitation as accepted
    invitation.status = 'ACCEPTED';
    await invitation.save();

    // 4. Create membership in the new company
    await UserCompany.create({
      userId: req.user.userId,
      companyId: invitation.companyId,
      role: invitation.role
    });

    // 5. Create employee record
    const userDoc = await User.findById(req.user.userId);
    let employeeRecord = await Employee.findOne({
      companyId: invitation.companyId,
      email: req.user.email
    });

    if (!employeeRecord) {
      await Employee.create({
        companyId: invitation.companyId,
        userId: req.user.userId,
        name: name,
        email: req.user.email,
        phone: phoneNumber,
        salary: 0,
        designation: occupation,
        department: department || undefined,
        status: 'ACTIVE'
      });
    } else {
      employeeRecord.userId = req.user.userId as any;
      employeeRecord.name = name;
      employeeRecord.phone = phoneNumber;
      employeeRecord.designation = occupation;
      if (department) employeeRecord.department = department;
      await employeeRecord.save();
    }

    // 6. Generate new JWT with company context
    const company = await Company.findById(invitation.companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

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
      company: { id: company._id, name: company.name, logo: company.logo }
    });
  } catch (err) {
    next(err);
  }
});

router.put(
  '/setup',
  authenticateToken,
  requireCompany,
  requireRole(['OWNER', 'ADMIN']),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.user || !req.user.currentCompanyId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { name, address, country, location, companyType, employeesCount, logo, departments, contactNumber, website } = req.body;

      const company = await Company.findById(req.user.currentCompanyId);
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }

      if (name) company.name = name.trim();
      if (address !== undefined) company.address = address;
      if (contactNumber !== undefined) company.contactNumber = contactNumber;
      if (website !== undefined) company.website = website;
      if (country !== undefined) company.country = country;
      if (location !== undefined) company.location = location;
      if (companyType !== undefined) company.companyType = companyType;
      if (employeesCount !== undefined) company.employeesCount = employeesCount;
      if (departments !== undefined) company.departments = departments;

      if (logo && typeof logo === 'string' && logo.startsWith('data:image')) {
        try {
          const uploadRes = await cloudinary.uploader.upload(logo, { folder: 'logos' });
          company.logo = uploadRes.secure_url;
        } catch (error) {
          console.error("Cloudinary Upload Error:", error);
        }
      } else if (logo && typeof logo === 'string') {
        company.logo = logo;
      }

      await company.save();

      return res.status(200).json({
        success: true,
        message: 'Company details updated successfully',
        company: {
          id: company._id,
          name: company.name,
          logo: company.logo,
          address: company.address,
          contactNumber: company.contactNumber,
          website: company.website,
          country: company.country,
          location: company.location,
          companyType: company.companyType,
          employeesCount: company.employeesCount,
          departments: company.departments
        }
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/members',
  authenticateToken,
  requireCompany,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.user || !req.user.currentCompanyId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const memberships = await UserCompany.find({ companyId: req.user.currentCompanyId }).populate('userId');

      return res.status(200).json({
        success: true,
        members: memberships.map((m: any) => ({
          id: m._id,
          role: m.role,
          createdAt: m.createdAt,
          user: m.userId ? {
            id: m.userId._id,
            name: m.userId.name,
            email: m.userId.email,
            profilePicture: m.userId.profilePicture
          } : null
        }))
      });
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/members/:id',
  authenticateToken,
  requireCompany,
  requireRole(['OWNER', 'ADMIN']),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.user || !req.user.currentCompanyId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const membership = await UserCompany.findOne({
        _id: req.params.id,
        companyId: req.user.currentCompanyId
      });

      if (!membership) {
        return res.status(404).json({ message: 'Member not found' });
      }

      if (membership.role === 'OWNER') {
        const ownerCount = await UserCompany.countDocuments({
          companyId: req.user.currentCompanyId,
          role: 'OWNER'
        });
        if (ownerCount <= 1) {
          return res.status(400).json({ message: 'Cannot remove the only owner of the company' });
        }
      }

      await UserCompany.findByIdAndDelete(membership._id);

      // Deactivate the corresponding Employee record for this user in this company
      try {
        const userDoc = await User.findById(membership.userId);
        if (userDoc) {
          const employee = await Employee.findOne({
            companyId: req.user.currentCompanyId,
            $or: [
              { userId: membership.userId },
              { email: userDoc.email.trim().toLowerCase() }
            ]
          });
          if (employee) {
            employee.status = 'INACTIVE';
            await employee.save();
          }
        }
      } catch (err) {
        console.error('Error deactivating employee record for removed member:', err);
      }

      return res.status(200).json({ success: true, message: 'Member removed successfully' });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/invitations',
  authenticateToken,
  requireCompany,
  requireRole(['OWNER', 'ADMIN', 'ACCOUNTANT']),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.user || !req.user.currentCompanyId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const invitations = await Invitation.find({ companyId: req.user.currentCompanyId, status: 'PENDING' });

      return res.status(200).json({
        success: true,
        invitations: invitations.map((inv: any) => ({
          id: inv._id,
          email: inv.email,
          role: inv.role,
          status: inv.status,
          token: inv.token,
          createdAt: inv.createdAt
        }))
      });
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/invitations/:id',
  authenticateToken,
  requireCompany,
  requireRole(['OWNER', 'ADMIN', 'ACCOUNTANT']),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.user || !req.user.currentCompanyId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const invitation = await Invitation.findOneAndDelete({
        _id: req.params.id,
        companyId: req.user.currentCompanyId
      });

      if (!invitation) {
        return res.status(404).json({ message: 'Invitation not found' });
      }

      return res.status(200).json({ success: true, message: 'Invitation cancelled successfully' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
