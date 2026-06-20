import { Router, Response, NextFunction } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { User } from '../models';

const router = Router();

router.put(
  '/profile',
  authenticateToken,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { name, age, occupation, phoneNumber } = req.body;

      const updatedUser = await User.findByIdAndUpdate(
        req.user.userId,
        {
          $set: {
            ...(name && { name }),
            ...(age && { age }),
            ...(occupation && { occupation }),
            ...(phoneNumber && { phoneNumber })
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
          phoneNumber: updatedUser.phoneNumber
        }
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
