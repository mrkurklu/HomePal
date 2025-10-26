import express, { Response } from 'express';
import User from '../models/User.js';
import { auth, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get all users (professionals for homeowners, homeowners for professionals)
router.get('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    let query: any = {};

    // Homeowners see professionals
    if (req.user?.role === 'homeowner') {
      query.role = 'professional';
    }

    // Professionals see homeowners
    if (req.user?.role === 'professional') {
      query.role = 'homeowner';
    }

    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single user
router.get('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user
router.put('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    // Only allow users to update their own profile
    if (req.user?.id !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

