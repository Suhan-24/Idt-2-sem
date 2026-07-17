import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/appointments?phone=9876543210&status=upcoming
router.get('/', (req, res) => {
  try {
    const { phone, status } = req.query;
    let results = db.find('appointments', (a) => {
      if (phone && a.patientPhone !== phone) return false;
      if (status && a.status !== status) return false;
      return true;
    });
    // Sort newest first
    results = results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, data: results });
  } catch (err) {
    console.error('GET /api/appointments error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/appointments
router.post('/', (req, res) => {
  try {
    const { patientName, patientPhone, doctorId, doctorName, doctorDept, date, slot, reason } = req.body;

    if (!patientName || !doctorId || !date || !slot) {
      return res.status(400).json({ success: false, error: 'patientName, doctorId, date and slot are required' });
    }

    // Check slot conflict
    const conflict = db.findOne('appointments', a =>
      a.doctorId === doctorId &&
      a.date === date &&
      a.slot === slot &&
      a.status === 'upcoming'
    );
    if (conflict) {
      return res.status(409).json({ success: false, error: 'This time slot is already booked' });
    }

    const appt = db.insert('appointments', {
      patientName,
      patientPhone: patientPhone || '',
      doctorId,
      doctorName: doctorName || '',
      doctorDept: doctorDept || '',
      date,
      slot,
      reason: reason || '',
      status: 'upcoming',
    });

    res.status(201).json({ success: true, data: appt });
  } catch (err) {
    console.error('POST /api/appointments error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/appointments/:id
router.patch('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.findOne('appointments', a => a.id === id);
    if (!existing) return res.status(404).json({ success: false, error: 'Appointment not found' });

    const { status, date, slot } = req.body;
    const updates = {};
    if (status) updates.status = status;
    if (date) updates.date = date;
    if (slot) updates.slot = slot;

    const updated = db.update('appointments', id, updates);
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('PATCH /api/appointments/:id error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/appointments/:id — soft cancel
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.findOne('appointments', a => a.id === id);
    if (!existing) return res.status(404).json({ success: false, error: 'Appointment not found' });

    db.update('appointments', id, { status: 'cancelled' });
    res.json({ success: true, message: 'Appointment cancelled' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
