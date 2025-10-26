import express, { Response } from 'express';
import Payment from '../models/Payment.js';
import Job from '../models/Job.js';
import Notification from '../models/Notification.js';
import { auth, AuthRequest } from '../middleware/auth.js';
import { io } from '../index.js';

const router = express.Router();

// Get payments for current user
router.get('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    let query: any = {};

    if (req.user?.role === 'homeowner') {
      query.homeowner = req.user.id;
    }

    if (req.user?.role === 'professional') {
      query.professional = req.user.id;
    }

    const payments = await Payment.find(query)
      .populate('job', 'title description')
      .populate('homeowner', 'name email')
      .populate('professional', 'name email')
      .sort('-createdAt');

    res.json(payments);
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create payment (mock implementation)
router.post('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { jobId, cardInfo } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (!job.price) {
      return res.status(400).json({ message: 'Job price not set' });
    }

    // Mock payment - In production, use Stripe
    const payment = new Payment({
      job: jobId,
      homeowner: job.homeowner,
      professional: job.professional,
      amount: job.price,
      paymentMethod: 'card',
      cardLast4: cardInfo.last4 || '0000',
      cardBrand: cardInfo.brand || 'visa',
      status: 'completed' // Mock - auto approve
    });

    await payment.save();

    // Create notifications
    await Notification.create({
      user: job.professional,
      type: 'job-completed',
      message: `${job.price} TL ödemesi alındı`,
      relatedJob: jobId
    });

    await Notification.create({
      user: job.homeowner,
      type: 'job-completed',
      message: `${job.price} TL ödendi`,
      relatedJob: jobId
    });

    const populatedPayment = await Payment.findById(payment._id)
      .populate('job', 'title description')
      .populate('homeowner', 'name email')
      .populate('professional', 'name email');

    io.emit('payment-completed', populatedPayment);

    res.status(201).json(populatedPayment);
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

