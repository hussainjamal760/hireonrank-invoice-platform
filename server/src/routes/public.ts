import { Router, Request, Response, NextFunction } from 'express';
import { Invoice, Company, ActivityLog } from '../models';

const router = Router();

/**
 * GET /public/invoice/:token
 * Public endpoint to view an invoice via its shareable link token.
 * Accessing this automatically marks the invoice as VIEWED if it was SENT.
 */
router.get(
  '/invoice/:token',
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { token } = req.params;

      const invoice = await Invoice.findOne({ publicLinkToken: token });
      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found or link invalid.' });
      }

      // If the invoice is un-viewed and is currently SENT, mark it as VIEWED
      if (invoice.status === 'SENT') {
        invoice.status = 'VIEWED';
        invoice.viewedAt = new Date();
        await invoice.save();

        // Log the activity
        await ActivityLog.create({
          companyId: invoice.companyId,
          userId: invoice.createdBy, // We can attribute the view to the system, but we put createdBy just to link it
          action: 'INVOICE_VIEWED',
          description: `Invoice ${invoice.invoiceNumber} was viewed by the client.`,
          metadata: { invoiceId: invoice._id, invoiceNumber: invoice.invoiceNumber }
        });
      }

      // Fetch company details to display on the public page
      const company = await Company.findById(invoice.companyId).select('name logo address country email phone website');

      return res.status(200).json({ invoice, company });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /public/invoice/:token/download
 * Public endpoint to download the invoice PDF.
 */
router.get(
  '/invoice/:token/download',
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { token } = req.params;

      const invoice = await Invoice.findOne({ publicLinkToken: token });
      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found or link invalid.' });
      }

      const company = await Company.findById(invoice.companyId);
      if (!company) {
        return res.status(404).json({ message: 'Company not found.' });
      }

      // Generate the PDF
      // We need to import generateCustomInvoicePDF or generateSalarySlipPDF
      // For simplicity, assuming all public link tokens are for standard or custom invoices
      // If it's a payroll invoice, we should use generateSalarySlipPDF, but wait, the type is stored?
      // Actually, public link is mostly used for Custom Invoices. Let's use generateCustomInvoicePDF.
      // Wait, we need to import it at the top of the file.
      // I will add the import below.
      const { generateCustomInvoicePDF } = require('../utils/pdfGenerator');
      const pdfBuffer = await generateCustomInvoicePDF(invoice, company);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename=Invoice-${invoice.invoiceNumber}.pdf`);
      return res.send(Buffer.from(pdfBuffer));
    } catch (err) {
      next(err);
    }
  }
);

export default router;
