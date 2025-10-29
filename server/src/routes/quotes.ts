import express, { Response } from 'express';
import Quote from '../models/Quote.js';
import Job from '../models/Job.js';
import Notification from '../models/Notification.js';
import { auth, AuthRequest } from '../middleware/auth.js';
import { io } from '../index.js';

const router = express.Router();

// Get all quotes for current user
router.get('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    let query: any = {};

    // Homeowners see quotes for their jobs
    if (req.user?.role === 'homeowner') {
      query.homeowner = req.user.id;
    }

    // Professionals see their own quotes
    if (req.user?.role === 'professional') {
      query.professional = req.user.id;
    }

    const quotes = await Quote.find(query)
      .populate('job', 'title description category status priority')
      .populate('professional', 'name email phone rating')
      .populate('homeowner', 'name email phone')
      .sort('-createdAt');

    res.json(quotes);
  } catch (error) {
    console.error('Get quotes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single quote
router.get('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    const quote = await Quote.findById(req.params.id)
      .populate('job', 'title description category status priority location')
      .populate('professional', 'name email phone rating completedJobs specialties')
      .populate('homeowner', 'name email phone address');

    if (!quote) {
      return res.status(404).json({ message: 'Quote not found' });
    }

    // Check permission
    if (req.user?.role === 'homeowner' && quote.homeowner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.user?.role === 'professional' && quote.professional.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(quote);
  } catch (error) {
    console.error('Get quote error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create quote
router.post('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { jobId, price, message } = req.body;

    // Only professionals can create quotes
    if (req.user?.role !== 'professional') {
      return res.status(403).json({ message: 'Only professionals can create quotes' });
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if already has pending or accepted quote
    const existingQuote = await Quote.findOne({
      job: jobId,
      professional: req.user.id,
      status: { $in: ['pending', 'accepted'] }
    });

    if (existingQuote) {
      return res.status(400).json({ message: 'You have already quoted for this job' });
    }

    // Check if price is within the allowed range
    if (job.minPrice && job.maxPrice && (price < job.minPrice || price > job.maxPrice)) {
      return res.status(400).json({ 
        message: `Fiyat ${job.minPrice} - ${job.maxPrice} TL arasında olmalıdır.` 
      });
    }

    const quote = new Quote({
      job: jobId,
      professional: req.user.id,
      homeowner: job.homeowner,
      price,
      message,
      status: 'pending'
    });

    await quote.save();

    const populatedQuote = await Quote.findById(quote._id)
      .populate('job', 'title description')
      .populate('professional', 'name email')
      .populate('homeowner', 'name email');

    // Create notification for homeowner
    if (populatedQuote.homeowner && typeof populatedQuote.homeowner === 'object' && populatedQuote.professional && typeof populatedQuote.professional === 'object') {
      await Notification.create({
        user: populatedQuote.homeowner._id,
        type: 'quote-received',
        message: `${populatedQuote.professional.name} işinize teklif verdi: ${quote.price} TL`,
        relatedJob: quote.job,
        relatedQuote: quote._id
      });
    }

    // Emit to socket
    io.to(job.homeowner.toString()).emit('new-quote', populatedQuote);

    res.status(201).json(populatedQuote);
  } catch (error) {
    console.error('Create quote error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept quote
router.put('/:id/accept', auth, async (req: AuthRequest, res: Response) => {
  try {
    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      return res.status(404).json({ message: 'Quote not found' });
    }

    // Only homeowner can accept
    if (req.user?.role !== 'homeowner' || quote.homeowner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (quote.status !== 'pending') {
      return res.status(400).json({ message: 'Quote already processed' });
    }

    // Update quote status
    quote.status = 'accepted';
    await quote.save();

    // Update job with price from quote
    const job = await Job.findById(quote.job);
    if (job) {
      job.professional = quote.professional;
      job.status = 'accepted';
      job.price = quote.price; // Set price from accepted quote
      await job.save();

      // Reject other quotes for this job
      await Quote.updateMany(
        { 
          job: quote.job, 
          _id: { $ne: quote._id },
          status: 'pending'
        },
        { status: 'rejected' }
      );
    }

    const updatedQuote = await Quote.findById(quote._id)
      .populate('job', 'title description')
      .populate('professional', 'name email')
      .populate('homeowner', 'name email');

    // Create notification for professional
    if (updatedQuote.professional && typeof updatedQuote.professional === 'object') {
      await Notification.create({
        user: updatedQuote.professional._id,
        type: 'quote-accepted',
        message: 'Teklifiniz kabul edildi! İşe başlayabilirsiniz.',
        relatedJob: quote.job,
        relatedQuote: quote._id
      });
    }

    io.to(quote.professional.toString()).emit('quote-accepted', updatedQuote);

    res.json(updatedQuote);
  } catch (error) {
    console.error('Accept quote error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject quote
router.put('/:id/reject', auth, async (req: AuthRequest, res: Response) => {
  try {
    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      return res.status(404).json({ message: 'Quote not found' });
    }

    // Only homeowner can reject
    if (req.user?.role !== 'homeowner' || quote.homeowner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    quote.status = 'rejected';
    await quote.save();

    const updatedQuote = await Quote.findById(quote._id)
      .populate('job', 'title description')
      .populate('professional', 'name email')
      .populate('homeowner', 'name email');

    // Create notification for professional
    if (updatedQuote.professional && typeof updatedQuote.professional === 'object') {
      await Notification.create({
        user: updatedQuote.professional._id,
        type: 'quote-rejected',
        message: 'Teklifiniz reddedildi.',
        relatedJob: quote.job,
        relatedQuote: quote._id
      });
    }

    io.to(quote.professional.toString()).emit('quote-rejected', updatedQuote);

    res.json(updatedQuote);
  } catch (error) {
    console.error('Reject quote error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

