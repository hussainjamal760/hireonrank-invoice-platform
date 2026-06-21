import { Router, Request, Response, NextFunction } from 'express';
import { Invoice, ActivityLog, Company } from '../models';
import { authenticateToken, requireCompany, requireRole, AuthRequest } from '../middleware/auth';
import { generateCustomInvoicePDF } from '../utils/pdfGenerator';
import crypto from 'crypto';

const router = Router();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Generate a sequential invoice number in the format INV-YYYYMM-XXXX.
 * XXXX is a zero-padded counter that resets each month per company.
 */
const generateInvoiceNumber = async (companyId: string): Promise<string> => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `INV-${year}${month}`;

  // Start & end of the current month (UTC)
  const monthStart = new Date(year, now.getMonth(), 1);
  const monthEnd = new Date(year, now.getMonth() + 1, 1);

  const count = await Invoice.countDocuments({
    companyId,
    createdAt: { $gte: monthStart, $lt: monthEnd }
  });

  const seq = String(count + 1).padStart(4, '0');
  return `${prefix}-${seq}`;
};

/**
 * Calculate subtotal, taxAmount and totalAmount from line items + taxRate.
 */
const calculateAmounts = (items: { description: string; quantity: number; unitPrice: number }[], taxRate: number) => {
  const calculatedItems = items.map((item) => ({
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    amount: item.quantity * item.unitPrice
  }));

  const subtotal = calculatedItems.reduce((sum, i) => sum + i.amount, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const totalAmount = subtotal + taxAmount;

  return { calculatedItems, subtotal, taxAmount, totalAmount };
};

// ---------------------------------------------------------------------------
// Valid status transitions map
// ---------------------------------------------------------------------------
const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['SENT', 'CANCELLED'],
  SENT: ['VIEWED', 'PAID', 'OVERDUE', 'CANCELLED'],
  VIEWED: ['PAID', 'OVERDUE', 'CANCELLED'],
  OVERDUE: ['PAID', 'CANCELLED'],
  PAID: []
};

// Map target status -> ActivityLog action
const STATUS_ACTION_MAP: Record<string, string> = {
  SENT: 'INVOICE_SENT',
  VIEWED: 'INVOICE_VIEWED',
  PAID: 'INVOICE_PAID',
  CANCELLED: 'INVOICE_CANCELLED'
};

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

/**
 * POST /invoices
 * Create a new invoice.
 * Allowed roles: OWNER, ADMIN, ACCOUNTANT
 */
router.post(
  '/',
  authenticateToken,
  requireCompany,
  requireRole(['OWNER', 'ADMIN', 'ACCOUNTANT']),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.user || !req.user.currentCompanyId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { 
        clientName, 
        clientEmail, 
        clientAddress, 
        items, 
        taxRate, 
        dueDate, 
        notes,
        logoUrl,
        customFields,
        employeeIds,
        clientId,
        currency
      } = req.body;

      // --- Validation ---
      if (!clientName || typeof clientName !== 'string') {
        return res.status(400).json({ message: 'clientName is required' });
      }
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'At least one line item is required' });
      }
      for (const item of items) {
        if (!item.description || typeof item.quantity !== 'number' || typeof item.unitPrice !== 'number') {
          return res.status(400).json({ message: 'Each item must have description, quantity (number) and unitPrice (number)' });
        }
        if (item.quantity < 1) {
          return res.status(400).json({ message: 'Item quantity must be at least 1' });
        }
        if (item.unitPrice < 0) {
          return res.status(400).json({ message: 'Item unitPrice cannot be negative' });
        }
      }
      if (!dueDate) {
        return res.status(400).json({ message: 'dueDate is required' });
      }

      // --- Calculations ---
      const effectiveTaxRate = typeof taxRate === 'number' ? taxRate : 0;
      const { calculatedItems, subtotal, taxAmount, totalAmount } = calculateAmounts(items, effectiveTaxRate);

      // --- Invoice number ---
      const invoiceNumber = await generateInvoiceNumber(req.user.currentCompanyId);

      // --- Create ---
      const invoice = await Invoice.create({
        companyId: req.user.currentCompanyId,
        invoiceNumber,
        clientName: clientName.trim(),
        clientEmail: clientEmail || undefined,
        clientAddress: clientAddress || undefined,
        items: calculatedItems,
        subtotal,
        taxRate: effectiveTaxRate,
        taxAmount,
        totalAmount,
        status: 'DRAFT',
        dueDate: new Date(dueDate),
        publicLinkToken: crypto.randomBytes(32).toString('hex'),
        clientId: clientId || undefined,
        notes: notes || undefined,
        logoUrl: logoUrl || undefined,
        customFields: customFields || [],
        employeeIds: employeeIds || [],
        createdBy: req.user.userId,
        currency: currency || 'USD'
      });

      // --- Activity log ---
      await ActivityLog.create({
        companyId: req.user.currentCompanyId,
        userId: req.user.userId,
        action: 'INVOICE_CREATED',
        description: `Invoice ${invoiceNumber} created for ${clientName.trim()}`,
        metadata: { invoiceId: invoice._id, invoiceNumber, totalAmount }
      });

      return res.status(201).json({ success: true, invoice });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /invoices
 * List invoices with pagination & filters.
 * Query params: page, limit, status, startDate, endDate, search (clientName)
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

      const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
      const limit = Math.min(Math.max(parseInt(req.query.limit as string, 10) || 20, 1), 100);
      const skip = (page - 1) * limit;

      // Build filter
      const filter: Record<string, any> = { companyId: req.user.currentCompanyId };

      if (req.query.status) {
        filter.status = req.query.status;
      }

      if (req.query.startDate || req.query.endDate) {
        filter.createdAt = {};
        if (req.query.startDate) {
          filter.createdAt.$gte = new Date(req.query.startDate as string);
        }
        if (req.query.endDate) {
          filter.createdAt.$lte = new Date(req.query.endDate as string);
        }
      }

      if (req.query.search) {
        filter.clientName = { $regex: req.query.search as string, $options: 'i' };
      }

      const [invoices, total] = await Promise.all([
        Invoice.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Invoice.countDocuments(filter)
      ]);

      return res.status(200).json({
        invoices,
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
 * GET /invoices/:id
 * Get a single invoice by ID.
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

      const invoice = await Invoice.findOne({
        _id: req.params.id,
        companyId: req.user.currentCompanyId
      });

      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }

      return res.status(200).json({ invoice });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PUT /invoices/:id
 * Update a DRAFT invoice.
 * Allowed roles: OWNER, ADMIN, ACCOUNTANT
 */
router.put(
  '/:id',
  authenticateToken,
  requireCompany,
  requireRole(['OWNER', 'ADMIN', 'ACCOUNTANT']),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.user || !req.user.currentCompanyId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const invoice = await Invoice.findOne({
        _id: req.params.id,
        companyId: req.user.currentCompanyId
      });

      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }

      if (invoice.status !== 'DRAFT') {
        return res.status(400).json({ message: 'Only DRAFT invoices can be updated' });
      }

      const { clientName, clientEmail, clientAddress, items, taxRate, dueDate, notes, clientId } = req.body;

      // Apply simple field updates
      if (clientName !== undefined) invoice.clientName = clientName.trim();
      if (clientEmail !== undefined) invoice.clientEmail = clientEmail;
      if (clientAddress !== undefined) invoice.clientAddress = clientAddress;
      if (dueDate !== undefined) invoice.dueDate = new Date(dueDate);
      if (notes !== undefined) invoice.notes = notes;
      if (clientId !== undefined) invoice.clientId = clientId;

      // Recalculate amounts when items or taxRate change
      const newItems = items !== undefined ? items : invoice.items;
      const newTaxRate = taxRate !== undefined ? taxRate : invoice.taxRate;

      if (items !== undefined) {
        if (!Array.isArray(items) || items.length === 0) {
          return res.status(400).json({ message: 'At least one line item is required' });
        }
        for (const item of items) {
          if (!item.description || typeof item.quantity !== 'number' || typeof item.unitPrice !== 'number') {
            return res.status(400).json({ message: 'Each item must have description, quantity (number) and unitPrice (number)' });
          }
        }
      }

      const { calculatedItems, subtotal, taxAmount, totalAmount } = calculateAmounts(newItems, newTaxRate);
      invoice.items = calculatedItems as any;
      invoice.taxRate = newTaxRate;
      invoice.subtotal = subtotal;
      invoice.taxAmount = taxAmount;
      invoice.totalAmount = totalAmount;

      await invoice.save();

      return res.status(200).json({ success: true, invoice });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PATCH /invoices/:id/status
 * Transition an invoice to a new status.
 * Allowed roles: OWNER, ADMIN, ACCOUNTANT
 *
 * Valid transitions:
 *   DRAFT  -> SENT | CANCELLED
 *   SENT   -> PAID | CANCELLED
 */
router.patch(
  '/:id/status',
  authenticateToken,
  requireCompany,
  requireRole(['OWNER', 'ADMIN', 'ACCOUNTANT']),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.user || !req.user.currentCompanyId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { status: newStatus } = req.body;

      if (!newStatus) {
        return res.status(400).json({ message: 'status is required' });
      }

      const invoice = await Invoice.findOne({
        _id: req.params.id,
        companyId: req.user.currentCompanyId
      });

      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }

      // Validate transition
      const allowed = VALID_TRANSITIONS[invoice.status];
      if (!allowed || !allowed.includes(newStatus)) {
        return res.status(400).json({
          message: `Cannot transition from ${invoice.status} to ${newStatus}`
        });
      }

      invoice.status = newStatus;

      if (newStatus === 'SENT') {
        invoice.sentAt = new Date();
      }
      if (newStatus === 'VIEWED' && !invoice.viewedAt) {
        invoice.viewedAt = new Date();
      }
      if (newStatus === 'PAID') {
        invoice.paidAt = new Date();
      }

      await invoice.save();

      // Activity log
      const action = STATUS_ACTION_MAP[newStatus];
      if (action) {
        await ActivityLog.create({
          companyId: req.user.currentCompanyId as string,
          userId: req.user.userId,
          action: action as any,
          description: `Invoice ${invoice.invoiceNumber} marked as ${newStatus}`,
          metadata: { invoiceId: invoice._id, invoiceNumber: invoice.invoiceNumber }
        });
      }

      return res.status(200).json({ success: true, invoice });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * DELETE /invoices/:id
 * Hard-delete a DRAFT invoice.
 * Allowed roles: OWNER, ADMIN
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

      const invoice = await Invoice.findOne({
        _id: req.params.id,
        companyId: req.user.currentCompanyId
      });

      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }

      if (invoice.status !== 'DRAFT') {
        return res.status(400).json({ message: 'Only DRAFT invoices can be deleted' });
      }

      await invoice.deleteOne();

      return res.status(200).json({ success: true, message: 'Invoice deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /invoices/:id/download
 * Generates and downloads the PDF for a custom invoice.
 */
router.get(
  '/:id/download',
  authenticateToken,
  requireCompany,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { id } = req.params;
      const companyId = req.user!.currentCompanyId;

      const [invoice, company] = await Promise.all([
        Invoice.findOne({ _id: id, companyId }),
        Company.findById(companyId)
      ]);

      if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
      if (!company) return res.status(404).json({ message: 'Company not found' });

      const pdfBuffer = await generateCustomInvoicePDF(invoice, company);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Invoice-${invoice.invoiceNumber}.pdf`);
      return res.send(Buffer.from(pdfBuffer));
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /invoices/:id/send
 * Sends the invoice to the client via email and marks it as SENT.
 */
router.post(
  '/:id/send',
  authenticateToken,
  requireCompany,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { id } = req.params;
      const companyId = req.user!.currentCompanyId;

      const [invoice, company] = await Promise.all([
        Invoice.findOne({ _id: id, companyId }),
        Company.findById(companyId)
      ]);

      if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
      if (!company) return res.status(404).json({ message: 'Company not found' });

      const { email } = req.body;
      const targetEmail = (email || invoice.clientEmail || '').trim().toLowerCase();
      if (!targetEmail) {
        return res.status(400).json({ message: 'Client email is required to send the invoice' });
      }

      if (targetEmail !== invoice.clientEmail) {
        invoice.clientEmail = targetEmail;
      }

      // Generate the PDF buffer
      const pdfBuffer = await generateCustomInvoicePDF(invoice, company);

      // Setup nodemailer
      const nodemailer = require('nodemailer');
      
      // Use SMTP config if available, otherwise use a JSON transport (mock)
      let transporter;
      if (process.env.EMAIL_USER && process.env.GOOGLE_CLIENT_ID) {
        transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            type: 'OAuth2',
            user: process.env.EMAIL_USER,
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            refreshToken: process.env.GOOGLE_REFRESH_TOKEN
          }
        });
      } else if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_PORT === '465',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });
      } else {
        transporter = nodemailer.createTransport({ jsonTransport: true });
        console.log('Using mock JSON transport for email.');
      }

      const invoiceUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/public/invoice/${invoice.publicLinkToken}`;
      
      const mailOptions = {
        from: `"${company.name}" <${process.env.EMAIL_USER || process.env.SMTP_USER || 'no-reply@radicalledger.com'}>`,
        to: invoice.clientEmail,
        subject: `Invoice ${invoice.invoiceNumber} from ${company.name}`,
        text: `Dear ${invoice.clientName},\n\nPlease find attached your invoice ${invoice.invoiceNumber} for the amount of $${invoice.totalAmount.toLocaleString()}.\n\nThank you for your business!\n\n${company.name}`,
        html: `<p>Dear <strong>${invoice.clientName}</strong>,</p>
               <p>Please find attached your invoice <strong>${invoice.invoiceNumber}</strong> for the amount of <strong>$${invoice.totalAmount.toLocaleString()}</strong>.</p>
               <p>You can also view your invoice online <a href="${invoiceUrl}">here</a>.</p>
               <div style="margin: 20px 0;">
                 <p>Scan this QR code to view your invoice:</p>
                 <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(invoiceUrl)}" alt="Invoice QR Code" style="border: 1px solid #ccc; padding: 5px; border-radius: 5px;" />
               </div>
               <p>Thank you for your business!</p>
               <p><strong>${company.name}</strong></p>`,
        attachments: [
          {
            filename: `Invoice-${invoice.invoiceNumber}.pdf`,
            content: Buffer.from(pdfBuffer),
            contentType: 'application/pdf'
          }
        ]
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email dispatched: ', info.messageId || 'Mock JSON');

      // Update invoice status
      if (invoice.status === 'DRAFT') {
        invoice.status = 'SENT';
      }
      invoice.sentAt = new Date();
      await invoice.save();

      // Log activity
      await ActivityLog.create({
        companyId: companyId!,
        userId: req.user!.userId,
        action: 'INVOICE_SENT',
        description: `Invoice ${invoice.invoiceNumber} was sent to ${invoice.clientEmail}`,
        metadata: { invoiceId: invoice._id, invoiceNumber: invoice.invoiceNumber }
      });

      return res.status(200).json({ message: 'Invoice sent successfully', invoice });
    } catch (err) {
      console.error('Email send error:', err);
      next(err);
    }
  }
);

export default router;
