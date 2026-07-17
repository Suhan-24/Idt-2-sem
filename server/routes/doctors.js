import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/doctors?dept=cardiology&q=ramesh&available=1
router.get('/', (req, res) => {
  try {
    const { dept, q, available } = req.query;
    let results = db.find('doctors', (d) => {
      if (dept && d.dept !== dept) return false;
      if (available === '1' && !d.available) return false;
      if (q) {
        const lq = q.toLowerCase();
        if (!d.name.toLowerCase().includes(lq) &&
            !d.specialization.toLowerCase().includes(lq) &&
            !d.bio.toLowerCase().includes(lq) &&
            !d.dept.toLowerCase().includes(lq)) return false;
      }
      return true;
    });
    results = results.sort((a, b) => b.rating - a.rating);
    res.json({ success: true, data: results });
  } catch (err) {
    console.error('GET /api/doctors error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/doctors/:id
router.get('/:id', (req, res) => {
  try {
    const doc = db.findOne('doctors', d => d.id === req.params.id);
    if (!doc) return res.status(404).json({ success: false, error: 'Doctor not found' });
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
