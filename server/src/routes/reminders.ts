import { Router } from 'express';
import Reminder from '../models/Reminder.js';
import { auth, authorize, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Category-based suggestion mapping (AI-like fixed suggestions)
const CATEGORY_SUGGESTIONS: Record<string, { name: string; frequencyDays: number }>
  = {
    cati: { name: 'Çatı bakımı', frequencyDays: 365 }, // yearly
    tesisat: { name: 'Tesisat kaçak kontrolü', frequencyDays: 180 }, // 6 months
    elektrik: { name: 'Elektrik tesisatı kontrolü', frequencyDays: 365 }, // yearly
    bahce: { name: 'Bahçe sulama sistemi bakımı', frequencyDays: 90 }, // quarterly
    boya: { name: 'Duvarda boya/derz kontrolü', frequencyDays: 180 },
    klima: { name: 'Klima filtre temizliği', frequencyDays: 90 }
  };

router.get('/suggestions/:category', auth, authorize('homeowner'), async (req, res) => {
  const { category } = req.params;
  const suggestion = CATEGORY_SUGGESTIONS[category];
  if (!suggestion) {
    return res.status(404).json({ message: 'Kategori için öneri bulunamadı' });
  }
  res.json(suggestion);
});

// Create reminder (homeowner only)
router.post('/', auth, authorize('homeowner'), async (req: AuthRequest, res) => {
  try {
    const { name, category, frequencyDays, nextDueDate, notes } = req.body;
    if (!name || !category || !frequencyDays) {
      return res.status(400).json({ message: 'Zorunlu alanlar eksik' });
    }

    const dueDate = nextDueDate ? new Date(nextDueDate) : new Date(Date.now() + frequencyDays * 24 * 60 * 60 * 1000);

    const reminder = await Reminder.create({
      homeowner: req.user!.id,
      name,
      category,
      frequencyDays,
      nextDueDate: dueDate,
      notes
    });

    res.status(201).json(reminder);
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// List current user's reminders
router.get('/', auth, authorize('homeowner'), async (req: AuthRequest, res) => {
  try {
    const reminders = await Reminder.find({ homeowner: req.user!.id }).sort({ nextDueDate: 1 });
    res.json(reminders);
  } catch (error) {
    console.error('List reminders error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Update reminder
router.put('/:id', auth, authorize('homeowner'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const reminder = await Reminder.findOneAndUpdate(
      { _id: id, homeowner: req.user!.id },
      updates,
      { new: true }
    );
    if (!reminder) return res.status(404).json({ message: 'Hatırlatıcı bulunamadı' });
    res.json(reminder);
  } catch (error) {
    console.error('Update reminder error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Delete reminder
router.delete('/:id', auth, authorize('homeowner'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const reminder = await Reminder.findOneAndDelete({ _id: id, homeowner: req.user!.id });
    if (!reminder) return res.status(404).json({ message: 'Hatırlatıcı bulunamadı' });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete reminder error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

export default router;


