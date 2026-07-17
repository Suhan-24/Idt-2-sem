import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/patients?phone=9876543210
router.get('/', (req, res) => {
  try {
    const { phone } = req.query;
    const results = db.find('patients', p => !phone || p.phone === phone);
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/patients — upsert by phone
router.post('/', (req, res) => {
  try {
    const { name, phone, email, dob, blood_group } = req.body;
    if (!name || !phone) return res.status(400).json({ success: false, error: 'name and phone are required' });

    const existing = db.findOne('patients', p => p.phone === phone);
    if (existing) {
      const updated = db.update('patients', existing.id, {
        name,
        email: email || existing.email,
        dob: dob || existing.dob,
        blood_group: blood_group || existing.blood_group,
      });
      return res.json({ success: true, data: updated });
    }

    const patient = db.insert('patients', { name, phone, email: email || '', dob: dob || '', blood_group: blood_group || '' });
    res.status(201).json({ success: true, data: patient });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
