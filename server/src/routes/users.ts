import { Router, Response, NextFunction } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { User } from '../models';

const router = Router();

router.get(
  '/profile',
  authenticateToken,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          age: user.age,
          occupation: user.occupation,
          phoneNumber: user.phoneNumber,
          preferredCurrency: user.preferredCurrency
        }
      });
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/profile',
  authenticateToken,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { name, age, occupation, phoneNumber, preferredCurrency } = req.body;

      const updatedUser = await User.findByIdAndUpdate(
        req.user.userId,
        {
          $set: {
            ...(name && { name }),
            ...(age && { age }),
            ...(occupation && { occupation }),
            ...(phoneNumber && { phoneNumber }),
            ...(preferredCurrency && { preferredCurrency })
          }
        },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json({
        success: true,
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          age: updatedUser.age,
          occupation: updatedUser.occupation,
          phoneNumber: updatedUser.phoneNumber,
          preferredCurrency: updatedUser.preferredCurrency
        }
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
