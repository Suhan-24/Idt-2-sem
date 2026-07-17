import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/medicines?category=Cardiology&q=aspirin
router.get('/', (req, res) => {
  try {
    const { category, q } = req.query;
    let results = db.find('medicines', (m) => {
      if (category && m.category !== category) return false;
      if (q) {
        const lq = q.toLowerCase();
        if (!m.name.toLowerCase().includes(lq) && !m.description.toLowerCase().includes(lq)) return false;
      }
      return true;
    });
    results = results.sort((a, b) => a.name.localeCompare(b.name));
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/medicines/:id
router.get('/:id', (req, res) => {
  try {
    const med = db.findOne('medicines', m => m.id === req.params.id);
    if (!med) return res.status(404).json({ success: false, error: 'Medicine not found' });
    res.json({ success: true, data: med });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
