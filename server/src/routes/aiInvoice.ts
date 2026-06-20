import { Router, Request, Response, NextFunction } from 'express';
import { Invoice, ActivityLog, Client } from '../models';
import { authenticateToken, requireCompany, requireRole, AuthRequest } from '../middleware/auth';
import { parseInvoiceText } from '../services/aiInvoiceService';
import crypto from 'crypto';

const router = Router();

const generateInvoiceNumber = async (companyId: string): Promise<string> => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `INV-${year}${month}`;

  const monthStart = new Date(year, now.getMonth(), 1);
  const monthEnd = new Date(year, now.getMonth() + 1, 1);

  const count = await Invoice.countDocuments({
    companyId,
    createdAt: { $gte: monthStart, $lt: monthEnd }
  });

  const seq = String(count + 1).padStart(4, '0');
  return `${prefix}-${seq}`;
};

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

/**
 * POST /api/ai/invoice/generate
 * Generates an invoice using AI text parsing.
 */
router.post(
  '/generate',
  authenticateToken,
  requireCompany,
  requireRole(['OWNER', 'ADMIN', 'ACCOUNTANT']),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.user || !req.user.currentCompanyId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { text, taxRate } = req.body;

      if (!text || typeof text !== 'string') {
        return res.status(400).json({ message: 'text is required' });
      }

      // 1. Call AI parsing service
      const parsedData = await parseInvoiceText(text);

      // Try to find client in DB to auto-fill email and address
      let clientEmail = parsedData.clientEmail;
      let clientId: any = undefined;
      let clientAddress: string | undefined = undefined;

      if (parsedData.client !== 'General Client' || parsedData.clientEmail) {
        const query: any = { companyId: req.user.currentCompanyId };
        const conditions = [];
        if (parsedData.client && parsedData.client !== 'General Client') {
          conditions.push({ name: { $regex: new RegExp(`^${parsedData.client}$`, 'i') } });
        }
        if (parsedData.clientEmail) {
          conditions.push({ email: { $regex: new RegExp(`^${parsedData.clientEmail}$`, 'i') } });
        }
        if (conditions.length > 0) {
          query.$or = conditions;
          const foundClient = await Client.findOne(query);
          if (foundClient) {
            clientId = foundClient._id;
            clientEmail = foundClient.email || clientEmail;
            clientAddress = foundClient.address;
            parsedData.client = foundClient.name;
          }
        }
      }

      // 2. Map items into DB schema structure
      const dbItems = parsedData.items.map((item) => ({
        description: item.name,
        quantity: 1,
        unitPrice: item.price
      }));

      // 3. Perform calculations
      const effectiveTaxRate = typeof taxRate === 'number' ? taxRate : 0;
      const { calculatedItems, subtotal, taxAmount, totalAmount } = calculateAmounts(dbItems, effectiveTaxRate);

      // 4. Generate invoice number
      const invoiceNumber = await generateInvoiceNumber(req.user.currentCompanyId);

      // 5. Default due date to 30 days from today
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      // 6. Create the invoice
      const invoice = await Invoice.create({
        companyId: req.user.currentCompanyId,
        clientId,
        invoiceNumber,
        clientName: parsedData.client,
        clientEmail,
        clientAddress,
        currency: parsedData.currency,
        items: calculatedItems,
        subtotal,
        taxRate: effectiveTaxRate,
        taxAmount,
        totalAmount,
        status: 'DRAFT',
        dueDate,
        publicLinkToken: crypto.randomBytes(32).toString('hex'),
        notes: `AI parsed from: "${text}"`,
        createdBy: req.user.userId
      });

      // 7. Log Activity
      await ActivityLog.create({
        companyId: req.user.currentCompanyId,
        userId: req.user.userId,
        action: 'INVOICE_CREATED',
        description: `Invoice ${invoiceNumber} (AI-generated) created for ${parsedData.client}`,
        metadata: { invoiceId: invoice._id, invoiceNumber, totalAmount }
      });

      return res.status(201).json({ success: true, invoice });
    } catch (err: any) {
      console.error('Error generating AI invoice:', err);
      return res.status(500).json({ message: err.message || 'Failed to generate AI invoice' });
    }
  }
);

export default router;
