import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, OtpVerification, UserCompany, Company } from '../models';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { sendOtpEmail } from '../utils/email';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Helper to hash OTP using SHA-256
const hashOtp = (otp: string): string => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

// Helper to generate a new JWT token
const generateToken = (userId: string, email: string, currentCompanyId: string | null, role: string | null): string => {
  return jwt.sign(
    { userId, email, currentCompanyId, role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Helper to execute SaaS multi-company routing logic and return final state
export const handlePostLoginRouting = async (user: any) => {
  let memberships = await UserCompany.find({ userId: user._id }).populate('companyId');

  if (memberships.length === 0) {
    // Automatically create a default company for the new user
    const defaultCompanyName = user.name ? `${user.name}'s Company` : 'My Company';
    const newCompany = await Company.create({
      name: defaultCompanyName,
      ownerId: user._id,
      createdAt: new Date()
    });

    const newMembership = await UserCompany.create({
      userId: user._id,
      companyId: newCompany._id,
      role: 'OWNER',
      createdAt: new Date()
    });

    // Re-fetch memberships to obtain the populated format
    memberships = await UserCompany.find({ userId: user._id }).populate('companyId');
  }

  if (memberships.length === 1) {
    const membership = memberships[0];
    const company = membership.companyId as any;
    const token = generateToken(user._id.toString(), user.email, company._id.toString(), membership.role);
    return {
      state: 'ONE_COMPANY_STATE',
      token,
      currentCompanyId: company._id,
      role: membership.role,
      company: {
        id: company._id,
        name: company.name,
        logo: company.logo
      },
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        profilePicture: user.profilePicture
      }
    };
  }

  // Multiple companies
  const token = generateToken(user._id.toString(), user.email, null, null);
  return {
    state: 'MULTIPLE_COMPANIES_STATE',
    token,
    companies: memberships.map((m: any) => ({
      id: m.companyId._id,
      name: m.companyId.name,
      logo: m.companyId.logo,
      role: m.role
    })),
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      profilePicture: user.profilePicture
    }
  };
};

/**
 * POST /auth/send-otp
 * Request: { email }
 */
router.post('/send-otp', async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Rate limit: Max 5 requests per 15 minutes per email
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const otpRequestCount = await OtpVerification.countDocuments({
      email: cleanEmail,
      createdAt: { $gte: fifteenMinutesAgo }
    });

    if (otpRequestCount >= 5) {
      return res.status(429).json({ 
        message: 'Too many OTP requests. Please try again after 15 minutes.' 
      });
    }

    // 2. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // 3. Store OTP Verification
    await OtpVerification.create({
      email: cleanEmail,
      otpHash,
      expiresAt,
      used: false
    });

    // 4. Send live OTP email via Gmail API / Nodemailer (falls back to console if unconfigured)
    await sendOtpEmail(cleanEmail, otp);

    // In non-production, return the OTP in response to ease testing
    const responsePayload: any = { message: 'OTP sent successfully' };
    if (process.env.NODE_ENV !== 'production') {
      responsePayload.otp = otp; // Only for development/testing
    }

    return res.status(200).json(responsePayload);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /auth/verify-otp
 * Request: { email, otp }
 */
router.post('/verify-otp', async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Find the latest unused OTP record
    const otpRecord = await OtpVerification.findOne({
      email: cleanEmail,
      used: false
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Check expiry
    if (new Date() > otpRecord.expiresAt) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Verify OTP hash
    const inputHash = hashOtp(otp);
    if (inputHash !== otpRecord.otpHash) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Mark OTP as used to prevent replay attacks
    otpRecord.used = true;
    await otpRecord.save();

    // Fetch or create User
    let user = await User.findOne({ email: cleanEmail });
    if (!user) {
      const name = req.body.name || cleanEmail.split('@')[0];
      user = await User.create({
        email: cleanEmail,
        name: name,
        createdAt: new Date()
      });
    }

    // Compute SaaS tenant logic
    const postLoginState = await handlePostLoginRouting(user);
    return res.status(200).json(postLoginState);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /auth/google-login
 * Request: { idToken }
 */
router.post('/google-login', async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'ID Token is required' });
    }

    // Verify Google Token via googleapis endpoint
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    if (!response.ok) {
      return res.status(400).json({ message: 'Invalid Google token' });
    }

    const payload = await response.json() as {
      email: string;
      name?: string;
      sub: string;
      picture?: string;
      email_verified?: string;
    };

    if (!payload.email) {
      return res.status(400).json({ message: 'Email not provided by Google' });
    }

    const cleanEmail = payload.email.trim().toLowerCase();

    // Fetch or create User
    let user = await User.findOne({ email: cleanEmail });
    if (!user) {
      user = await User.create({
        email: cleanEmail,
        name: payload.name || cleanEmail.split('@')[0],
        googleId: payload.sub,
        profilePicture: payload.picture,
        createdAt: new Date()
      });
    } else {
      // Update google profile details if not set
      let updated = false;
      if (!user.googleId) {
        user.googleId = payload.sub;
        updated = true;
      }
      if (!user.profilePicture && payload.picture) {
        user.profilePicture = payload.picture;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    }

    // Compute SaaS tenant logic
    const postLoginState = await handlePostLoginRouting(user);
    return res.status(200).json(postLoginState);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /auth/me
 * Protected Route
 */
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let company = null;
    if (req.user.currentCompanyId) {
      company = await Company.findById(req.user.currentCompanyId);
    }

    return res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        profilePicture: user.profilePicture
      },
      currentCompanyId: req.user.currentCompanyId,
      role: req.user.role,
      company: company ? {
        id: company._id,
        name: company.name,
        logo: company.logo
      } : null
    });
  } catch (err) {
    next(err);
  }
});

export default router;
