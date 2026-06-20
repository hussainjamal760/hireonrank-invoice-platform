import { Router, Response, NextFunction } from 'express';
import { Client } from '../models';
import { authenticateToken, requireCompany, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /clients
 * List all clients for the company.
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

      const clients = await Client.find({ companyId: req.user.currentCompanyId }).sort({ createdAt: -1 });
      return res.status(200).json({ clients });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /clients
 * Create a new client.
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

      const { name, email, phone, address, taxId, notes } = req.body;

      if (!name || !email) {
        return res.status(400).json({ message: 'Name and email are required.' });
      }

      const client = await Client.create({
        companyId: req.user.currentCompanyId,
        name: name.trim(),
        email: email.trim(),
        phone,
        address,
        taxId,
        notes
      });

      return res.status(201).json({ success: true, client });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PUT /clients/:id
 * Update an existing client.
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

      const { name, email, phone, address, taxId, notes } = req.body;

      const client = await Client.findOne({ _id: req.params.id, companyId: req.user.currentCompanyId });
      
      if (!client) {
        return res.status(404).json({ message: 'Client not found.' });
      }

      if (name) client.name = name.trim();
      if (email) client.email = email.trim();
      if (phone !== undefined) client.phone = phone;
      if (address !== undefined) client.address = address;
      if (taxId !== undefined) client.taxId = taxId;
      if (notes !== undefined) client.notes = notes;
      
      client.updatedAt = new Date();

      await client.save();

      return res.status(200).json({ success: true, client });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * DELETE /clients/:id
 * Delete a client.
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

      const result = await Client.deleteOne({ _id: req.params.id, companyId: req.user.currentCompanyId });

      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Client not found.' });
      }

      return res.status(200).json({ success: true, message: 'Client deleted successfully.' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
