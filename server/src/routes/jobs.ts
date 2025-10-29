import express, { Request, Response } from 'express';
import Job from '../models/Job.js';
import User from '../models/User.js';
import { auth, AuthRequest } from '../middleware/auth.js';
import { io } from '../index.js';

const router = express.Router();

// Category mapping for Turkish to English
const categoryMapping: { [key: string]: string } = {
  'tesisat': 'plumbing',
  'electrical': 'electrical',
  'elektrik': 'electrical',
  'hvac': 'hvac',
  'isıtma soğutma': 'hvac',
  'isıtma/soğutma': 'hvac',
  'appliances': 'appliances',
  'beyaz eşya': 'appliances',
  'paint': 'paint',
  'boya': 'paint',
  'furniture': 'furniture',
  'mobilya': 'furniture',
  'flooring': 'flooring',
  'zemin': 'flooring',
  'roofing': 'roofing',
  'çatı': 'roofing',
  'general': 'general',
  'genel': 'general',
  'other': 'other',
  'diğer': 'other'
};

// Category-based price range function
function getPriceRangeForCategory(category: string): { minPrice: number; maxPrice: number } {
  const priceRanges: { [key: string]: { minPrice: number; maxPrice: number } } = {
    'plumbing': { minPrice: 300, maxPrice: 5000 },      // Tesisat
    'electrical': { minPrice: 200, maxPrice: 3000 },   // Elektrik
    'hvac': { minPrice: 500, maxPrice: 10000 },         // Isıtma/Sogutma
    'appliances': { minPrice: 150, maxPrice: 5000 },   // Beyaz Eşya
    'paint': { minPrice: 500, maxPrice: 10000 },       // Boya
    'furniture': { minPrice: 200, maxPrice: 8000 },    // Mobilya
    'flooring': { minPrice: 1000, maxPrice: 15000 },   // Zemin
    'roofing': { minPrice: 2000, maxPrice: 20000 },    // Çatı
    'general': { minPrice: 200, maxPrice: 3000 },     // Genel
    'other': { minPrice: 150, maxPrice: 5000 }         // Diğer
  };
  
  return priceRanges[category] || priceRanges['other'];
}

// Get all jobs
router.get('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    let query: any = {};

    // Homeowners see only their jobs
    if (req.user?.role === 'homeowner') {
      query.homeowner = req.user.id;
    }

    // Professionals see available or assigned jobs matching their specialties
    if (req.user?.role === 'professional') {
      // Get user with specialties
      const user = await User.findById(req.user.id);
      const specialties = user?.specialties || [];
      
      // Map specialties to category codes
      const specialtyCategories = specialties
        .map((spec: string) => {
          const mapped = categoryMapping[spec.toLowerCase()];
          return mapped || spec.toLowerCase();
        })
        .filter(Boolean);


      // If no specialties defined, show all pending jobs
      if (specialtyCategories.length === 0) {
        query.$or = [
          { professional: req.user.id },
          { professional: null, status: 'pending' }
        ];
      } else {
        query.$or = [
          { professional: req.user.id }, // Jobs assigned to this professional
          { 
            professional: null, 
            status: 'pending',
            category: { $in: specialtyCategories }
          }
        ];
      }
    }

    const jobs = await Job.find(query)
      .populate('homeowner', 'name email phone')
      .populate('professional', 'name email phone')
      .sort('-createdAt');

    res.json(jobs);
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single job
router.get('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('homeowner', 'name email phone address')
      .populate('professional', 'name email phone rating completedJobs specialties');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create job
router.post('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category, priority, location, scheduledDate, photoUrl, minPrice, maxPrice } = req.body;

    // Get price range for category (or use provided values)
    let priceRange = { minPrice: 150, maxPrice: 5000 };
    if (minPrice && maxPrice) {
      // Use provided range from AI analysis
      priceRange = { minPrice, maxPrice };
    } else {
      // Use category-based range
      priceRange = getPriceRangeForCategory(category);
    }

    const job = new Job({
      title,
      description,
      category,
      priority,
      location,
      scheduledDate,
      photoUrl,
      minPrice: priceRange.minPrice,
      maxPrice: priceRange.maxPrice,
      homeowner: req.user?.id,
      status: 'pending'
    });

    await job.save();
    
    const populatedJob = await Job.findById(job._id)
      .populate('homeowner', 'name email');

    // Emit to socket for real-time updates
    io.emit('new-job', populatedJob);

    res.status(201).json(populatedJob);
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update job
router.put('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check permission
    if (req.user?.role === 'homeowner' && job.homeowner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    )
      .populate('homeowner', 'name email phone')
      .populate('professional', 'name email phone');

    // Emit to socket
    io.emit('job-updated', updatedJob);

    res.json(updatedJob);
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept job (professional only)
router.put('/:id/accept', auth, async (req: AuthRequest, res: Response) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status !== 'pending') {
      return res.status(400).json({ message: 'Job already accepted or completed' });
    }

    job.professional = req.user?.id as any;
    job.status = 'accepted';

    await job.save();

    const updatedJob = await Job.findById(job._id)
      .populate('homeowner', 'name email phone')
      .populate('professional', 'name email phone');

    io.emit('job-accepted', updatedJob);

    res.json(updatedJob);
  } catch (error) {
    console.error('Accept job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Complete job
router.put('/:id/complete', auth, async (req: AuthRequest, res: Response) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const { notes } = req.body;

    job.status = 'completed';
    job.completedDate = new Date();
    if (notes) job.notes = notes;

    await job.save();

    const updatedJob = await Job.findById(job._id)
      .populate('homeowner', 'name email phone')
      .populate('professional', 'name email phone');

    // Create notifications with payment info
    const Notification = (await import('../models/Notification.js')).default;
    if (job.homeowner) {
      await Notification.create({
        user: job.homeowner,
        type: 'job-completed',
        message: `İşiniz tamamlandı! ${job.price ? job.price + ' TL ödeme yapın.' : 'Lütfen ödeme yapın.'}`,
        relatedJob: job._id
      });
    }

    if (job.professional) {
      await Notification.create({
        user: job.professional,
        type: 'job-completed',
        message: 'İşi tamamladınız. Ödeme bekleniyor.',
        relatedJob: job._id
      });
    }

    io.emit('job-completed', updatedJob);

    res.json(updatedJob);
  } catch (error) {
    console.error('Complete job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

