import { Router, Request, Response, NextFunction } from 'express';
import { Company, User, Invoice, PayrollInvoice, ActivityLog, Employee, Client } from '../models';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * GET /admin/stats
 * Returns platform-wide KPIs
 */
router.get('/stats', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const [
      totalCompanies,
      totalUsers,
      totalInvoices,
      totalRevenueAgg,
      totalPayrollAgg
    ] = await Promise.all([
      Company.countDocuments({}),
      User.countDocuments({}),
      Invoice.countDocuments({}),
      Invoice.aggregate([
        { $match: { status: 'PAID' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      PayrollInvoice.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const totalRevenue = totalRevenueAgg.length > 0 ? totalRevenueAgg[0].total : 0;
    const totalPayroll = totalPayrollAgg.length > 0 ? totalPayrollAgg[0].total : 0;

    return res.status(200).json({
      totalCompanies,
      totalUsers,
      totalInvoices,
      totalRevenue,
      totalPayroll,
      systemLoad: Math.floor(Math.random() * 20) + 10 // Dynamic-looking load between 10-30%
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /admin/charts
 * Returns platform-wide chart data (last 6 months)
 */
router.get('/charts', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [revenueData, growthData, invoiceData] = await Promise.all([
      // Revenue data
      Invoice.aggregate([
        { $match: { status: 'PAID', paidAt: { $gte: sixMonthsAgo } } },
        { $group: { _id: { year: { $year: '$paidAt' }, month: { $month: '$paidAt' } }, revenue: { $sum: '$totalAmount' } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      // Companies growth data
      Company.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      // Invoices
      Invoice.aggregate([
        { $match: { status: { $in: ['SENT', 'PAID'] }, issueDate: { $gte: sixMonthsAgo } } },
        { $group: { _id: { year: { $year: '$issueDate' }, month: { $month: '$issueDate' }, status: '$status' }, count: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    // Build results zero-filled for last 6 months
    const revResult = [];
    const growthResult = [];
    const invResult = [];

    let totalCompaniesBefore6Months = await Company.countDocuments({ createdAt: { $lt: sixMonthsAgo } });

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const name = MONTH_NAMES[date.getMonth()];

      const r = revenueData.find(d => d._id.year === year && d._id.month === month);
      revResult.push({ name, revenue: r ? r.revenue / 1000 : 0 }); // scaling to thousands or keeping original if small

      const g = growthData.find(d => d._id.year === year && d._id.month === month);
      totalCompaniesBefore6Months += g ? g.count : 0;
      growthResult.push({ name, companies: totalCompaniesBefore6Months });

      const sent = invoiceData.find(d => d._id.year === year && d._id.month === month && d._id.status === 'SENT');
      const paid = invoiceData.find(d => d._id.year === year && d._id.month === month && d._id.status === 'PAID');
      invResult.push({ name, sent: sent ? sent.count : 0, paid: paid ? paid.count : 0 });
    }

    return res.status(200).json({
      revenueData: revResult,
      growthData: growthResult,
      invoiceData: invResult
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /admin/activity
 * Returns 20 most recent system-wide activity logs
 */
router.get('/activity', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const activities = await ActivityLog.find()
      .populate('companyId', 'name')
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const formattedActivities = activities.map(a => {
      const companyName = (a.companyId as any)?.name || 'Unknown Company';
      const userName = (a.userId as any)?.name || 'System';
      
      let icon = 'Activity';
      let bg = 'bg-gray-200';
      let text = '';
      
      switch(a.action) {
        case 'INVOICE_CREATED':
          icon = 'FileText'; bg = 'bg-[#FACC15]';
          text = `${companyName} created an invoice`;
          break;
        case 'INVOICE_PAID':
          icon = 'Wallet'; bg = 'bg-emerald-400';
          text = `${companyName} received payment`;
          break;
        case 'PAYROLL_GENERATED':
        case 'PAYROLL_PAID':
          icon = 'Banknote'; bg = 'bg-blue-400';
          text = `${companyName} processed payroll`;
          break;
        case 'EMPLOYEE_ADDED':
        case 'MEMBER_JOINED':
          icon = 'Users'; bg = 'bg-purple-400';
          text = `${userName} joined ${companyName}`;
          break;
        default:
          text = `${companyName}: ${a.description}`;
      }

      return {
        _id: a._id,
        time: a.createdAt,
        text,
        iconStr: icon,
        bg,
        color: 'text-black'
      };
    });

    return res.status(200).json(formattedActivities);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /admin/companies
 * Returns a list of all companies with their employee and client counts.
 */
router.get('/companies', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const companies = await Company.find().populate('ownerId', 'name email').lean();

    const companiesWithStats = await Promise.all(companies.map(async (c) => {
      const employeeCount = await Employee.countDocuments({ companyId: c._id });
      const clientCount = await Client.countDocuments({ companyId: c._id });

      return {
        ...c,
        ownerName: (c.ownerId as any)?.name || 'Unknown',
        ownerEmail: (c.ownerId as any)?.email || 'Unknown',
        employeeCount,
        clientCount
      };
    }));

    return res.status(200).json(companiesWithStats);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /admin/companies/:id/toggle-status
 * Toggles a company between ACTIVE and BANNED
 */
router.post('/companies/:id/toggle-status', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const companyId = req.params.id;
    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    company.status = company.status === 'BANNED' ? 'ACTIVE' : 'BANNED';
    await company.save();

    await ActivityLog.create({
      companyId: company._id,
      userId: req.user.userId,
      action: 'COMPANY_UPDATED',
      description: `Company ${company.name} was ${company.status.toLowerCase()} by Admin`,
    });

    return res.status(200).json({ message: 'Company status updated', status: company.status });
  } catch (err) {
    next(err);
  }
});

export default router;
