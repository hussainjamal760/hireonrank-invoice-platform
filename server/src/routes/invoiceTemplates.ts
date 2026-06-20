import { Router, Request, Response, NextFunction } from 'express';
import { InvoiceTemplate } from '../models';
import { authenticateToken, requireCompany, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

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

      const { name, theme, sections, branding, themeSettings, typography, layout } = req.body;

      if (!name || typeof name !== 'string') {
        return res.status(400).json({ message: 'Template name is required' });
      }

      const template = await InvoiceTemplate.create({
        companyId: req.user.currentCompanyId,
        name: name.trim(),
        theme: theme || 'modern-corporate',
        sections: sections || [],
        branding: branding || {},
        themeSettings: themeSettings || {},
        typography: typography || {},
        layout: layout || {},
        createdBy: req.user.userId
      });

      return res.status(201).json({ success: true, template });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/',
  authenticateToken,
  requireCompany,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.user || !req.user.currentCompanyId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const templates = await InvoiceTemplate.find({
        companyId: req.user.currentCompanyId
      }).sort({ updatedAt: -1 });

      return res.status(200).json({ templates });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/:id',
  authenticateToken,
  requireCompany,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.user || !req.user.currentCompanyId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const template = await InvoiceTemplate.findOne({
        _id: req.params.id,
        companyId: req.user.currentCompanyId
      });

      if (!template) {
        return res.status(404).json({ message: 'Template not found' });
      }

      return res.status(200).json({ template });
    } catch (err) {
      next(err);
    }
  }
);

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

      const template = await InvoiceTemplate.findOne({
        _id: req.params.id,
        companyId: req.user.currentCompanyId
      });

      if (!template) {
        return res.status(404).json({ message: 'Template not found' });
      }

      const { name, theme, sections, branding, themeSettings, typography, layout, isPublished } = req.body;

      if (name !== undefined) template.name = name.trim();
      if (theme !== undefined) template.theme = theme;
      if (sections !== undefined) template.sections = sections;
      if (branding !== undefined) template.branding = branding;
      if (themeSettings !== undefined) template.themeSettings = themeSettings;
      if (typography !== undefined) template.typography = typography;
      if (layout !== undefined) template.layout = layout;
      if (isPublished !== undefined) template.isPublished = isPublished;
      template.updatedAt = new Date();

      await template.save();

      return res.status(200).json({ success: true, template });
    } catch (err) {
      next(err);
    }
  }
);

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

      const template = await InvoiceTemplate.findOne({
        _id: req.params.id,
        companyId: req.user.currentCompanyId
      });

      if (!template) {
        return res.status(404).json({ message: 'Template not found' });
      }

      await template.deleteOne();

      return res.status(200).json({ success: true, message: 'Template deleted' });
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  '/:id/default',
  authenticateToken,
  requireCompany,
  requireRole(['OWNER', 'ADMIN', 'ACCOUNTANT']),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.user || !req.user.currentCompanyId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const template = await InvoiceTemplate.findOne({
        _id: req.params.id,
        companyId: req.user.currentCompanyId
      });

      if (!template) {
        return res.status(404).json({ message: 'Template not found' });
      }

      await InvoiceTemplate.updateMany(
        { companyId: req.user.currentCompanyId },
        { $set: { isDefault: false } }
      );

      template.isDefault = true;
      template.updatedAt = new Date();
      await template.save();

      return res.status(200).json({ success: true, template });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/:id/duplicate',
  authenticateToken,
  requireCompany,
  requireRole(['OWNER', 'ADMIN', 'ACCOUNTANT']),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.user || !req.user.currentCompanyId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const original = await InvoiceTemplate.findOne({
        _id: req.params.id,
        companyId: req.user.currentCompanyId
      });

      if (!original) {
        return res.status(404).json({ message: 'Template not found' });
      }

      const duplicate = await InvoiceTemplate.create({
        companyId: req.user.currentCompanyId,
        name: `${original.name} (Copy)`,
        theme: original.theme,
        sections: original.sections,
        branding: original.branding,
        themeSettings: original.themeSettings,
        typography: original.typography,
        layout: original.layout,
        isDefault: false,
        isPublished: false,
        createdBy: req.user.userId
      });

      return res.status(201).json({ success: true, template: duplicate });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
