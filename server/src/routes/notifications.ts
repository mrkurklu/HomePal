import express, { Response } from 'express';
import Notification from '../models/Notification.js';
import { auth, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get all notifications for current user
router.get('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await Notification.find({ user: req.user?.id })
      .populate('relatedJob', 'title')
      .sort('-createdAt')
      .limit(50);

    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req: AuthRequest, res: Response) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.user.toString() !== req.user?.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    notification.read = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    console.error('Update notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark all as read
router.put('/read-all', auth, async (req: AuthRequest, res: Response) => {
  try {
    await Notification.updateMany(
      { user: req.user?.id, read: false },
      { read: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

