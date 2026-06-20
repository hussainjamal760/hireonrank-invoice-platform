import { Router, Request, Response, NextFunction } from 'express';
import { Employee, Invoice, PayrollInvoice, ActivityLog, UserCompany } from '../models';
import mongoose from 'mongoose';
import { authenticateToken, requireCompany, AuthRequest } from '../middleware/auth';

const router = Router();

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Helper: compute a percentage-change string between two values.
 * Handles zero previous values to avoid division by zero.
 */
const computeTrend = (current: number, previous: number): string => {
  if (previous === 0 && current === 0) return 'N/A';
  if (previous === 0) return '+100%';
  const change = Math.round(((current - previous) / previous) * 100);
  return change >= 0 ? `+${change}%` : `${change}%`;
};

/**
 * GET /dashboard/stats
 * Returns KPI statistics for the authenticated user's current company,
 * including month-over-month trend indicators.
 */
router.get(
  '/stats',
  authenticateToken,
  requireCompany,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.user || !req.user.currentCompanyId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const companyId = new mongoose.Types.ObjectId(req.user.currentCompanyId as string);

      // Date boundaries for current and previous months
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

      // --- Total counts ---
      const [
        totalEmployees,
        totalInvoices,
        totalRevenueAgg,
        pendingRevenueAgg,
        totalPayrollAgg,
        teamMembers
      ] = await Promise.all([
        Employee.countDocuments({ companyId, status: 'ACTIVE' }),
        Invoice.countDocuments({ companyId }),
        Invoice.aggregate([
          { $match: { companyId: companyId, status: 'PAID' } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        Invoice.aggregate([
          { $match: { companyId: companyId, status: 'SENT' } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        PayrollInvoice.aggregate([
          { $match: { companyId: companyId, status: 'paid' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        UserCompany.countDocuments({ companyId })
      ]);

      const totalRevenue = totalRevenueAgg.length > 0 ? totalRevenueAgg[0].total : 0;
      const pendingRevenue = pendingRevenueAgg.length > 0 ? pendingRevenueAgg[0].total : 0;
      const totalPayroll = totalPayrollAgg.length > 0 ? totalPayrollAgg[0].total : 0;

      // --- Current month counts (for trend comparison) ---
      const [
        currentMonthEmployees,
        currentMonthInvoices,
        currentMonthRevenueAgg,
        currentMonthPendingAgg,
        currentMonthPayrollAgg,
        currentMonthMembers
      ] = await Promise.all([
        Employee.countDocuments({ companyId, status: 'ACTIVE', createdAt: { $gte: currentMonthStart } }),
        Invoice.countDocuments({ companyId, createdAt: { $gte: currentMonthStart } }),
        Invoice.aggregate([
          { $match: { companyId: companyId, status: 'PAID', paidAt: { $gte: currentMonthStart } } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        Invoice.aggregate([
          { $match: { companyId: companyId, status: 'SENT', issueDate: { $gte: currentMonthStart } } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        PayrollInvoice.aggregate([
          { $match: { companyId: companyId, status: 'paid', createdAt: { $gte: currentMonthStart } } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        UserCompany.countDocuments({ companyId, createdAt: { $gte: currentMonthStart } })
      ]);

      // --- Previous month counts (for trend comparison) ---
      const [
        prevMonthEmployees,
        prevMonthInvoices,
        prevMonthRevenueAgg,
        prevMonthPendingAgg,
        prevMonthPayrollAgg,
        prevMonthMembers
      ] = await Promise.all([
        Employee.countDocuments({
          companyId, status: 'ACTIVE',
          createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd }
        }),
        Invoice.countDocuments({
          companyId,
          createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd }
        }),
        Invoice.aggregate([
          { $match: { companyId: companyId, status: 'PAID', paidAt: { $gte: previousMonthStart, $lte: previousMonthEnd } } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        Invoice.aggregate([
          { $match: { companyId: companyId, status: 'SENT', issueDate: { $gte: previousMonthStart, $lte: previousMonthEnd } } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        PayrollInvoice.aggregate([
          { $match: { companyId: companyId, status: 'paid', createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd } } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        UserCompany.countDocuments({
          companyId,
          createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd }
        })
      ]);

      const currentMonthRevenue = currentMonthRevenueAgg.length > 0 ? currentMonthRevenueAgg[0].total : 0;
      const currentMonthPending = currentMonthPendingAgg.length > 0 ? currentMonthPendingAgg[0].total : 0;
      const currentMonthPayroll = currentMonthPayrollAgg.length > 0 ? currentMonthPayrollAgg[0].total : 0;

      const prevMonthRevenue = prevMonthRevenueAgg.length > 0 ? prevMonthRevenueAgg[0].total : 0;
      const prevMonthPending = prevMonthPendingAgg.length > 0 ? prevMonthPendingAgg[0].total : 0;
      const prevMonthPayroll = prevMonthPayrollAgg.length > 0 ? prevMonthPayrollAgg[0].total : 0;

      return res.status(200).json({
        totalEmployees,
        totalInvoices,
        totalRevenue,
        pendingRevenue,
        totalPayroll,
        teamMembers,
        trends: {
          employees: computeTrend(currentMonthEmployees, prevMonthEmployees),
          invoices: computeTrend(currentMonthInvoices, prevMonthInvoices),
          revenue: computeTrend(currentMonthRevenue, prevMonthRevenue),
          pendingRevenue: computeTrend(currentMonthPending, prevMonthPending),
          payroll: computeTrend(currentMonthPayroll, prevMonthPayroll),
          teamMembers: computeTrend(currentMonthMembers, prevMonthMembers)
        }
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /dashboard/revenue-chart
 * Returns monthly revenue data (last 6 months) from PAID invoices.
 * Uses MongoDB aggregation on the paidAt field.
 */
router.get(
  '/revenue-chart',
  authenticateToken,
  requireCompany,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.user || !req.user.currentCompanyId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const companyId = new mongoose.Types.ObjectId(req.user.currentCompanyId as string);

      // Calculate date 6 months ago from the start of the current month
      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

      const revenueData = await Invoice.aggregate([
        {
          $match: {
            companyId: companyId,
            status: 'PAID',
            paidAt: { $gte: sixMonthsAgo }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$paidAt' },
              month: { $month: '$paidAt' }
            },
            revenue: { $sum: '$totalAmount' }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }
        }
      ]);

      // Build a map of year-month to revenue for quick lookup
      const revenueMap = new Map<string, number>();
      for (const entry of revenueData) {
        const key = `${entry._id.year}-${entry._id.month}`;
        revenueMap.set(key, entry.revenue);
      }

      // Generate the last 6 months with zero-filling for missing months
      const result: { name: string; revenue: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
        result.push({
          name: MONTH_NAMES[date.getMonth()],
          revenue: revenueMap.get(key) || 0
        });
      }

      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /dashboard/invoice-chart
 * Returns monthly invoice counts (sent and paid) for the last 6 months.
 * Aggregates by issueDate and groups by status.
 */
router.get(
  '/invoice-chart',
  authenticateToken,
  requireCompany,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.user || !req.user.currentCompanyId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const companyId = new mongoose.Types.ObjectId(req.user.currentCompanyId as string);

      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

      const invoiceData = await Invoice.aggregate([
        {
          $match: {
            companyId: companyId,
            status: { $in: ['SENT', 'PAID'] },
            issueDate: { $gte: sixMonthsAgo }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$issueDate' },
              month: { $month: '$issueDate' },
              status: '$status'
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }
        }
      ]);

      // Build maps for sent and paid counts
      const sentMap = new Map<string, number>();
      const paidMap = new Map<string, number>();
      for (const entry of invoiceData) {
        const key = `${entry._id.year}-${entry._id.month}`;
        if (entry._id.status === 'SENT') {
          sentMap.set(key, entry.count);
        } else if (entry._id.status === 'PAID') {
          paidMap.set(key, entry.count);
        }
      }

      // Generate the last 6 months with zero-filling
      const result: { name: string; sent: number; paid: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
        result.push({
          name: MONTH_NAMES[date.getMonth()],
          sent: sentMap.get(key) || 0,
          paid: paidMap.get(key) || 0
        });
      }

      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /dashboard/activity
 * Returns the 20 most recent activity log entries for the current company.
 */
router.get(
  '/activity',
  authenticateToken,
  requireCompany,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.user || !req.user.currentCompanyId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const companyId = req.user.currentCompanyId as string;

      const activities = await ActivityLog.find({ companyId })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

      return res.status(200).json(activities);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
