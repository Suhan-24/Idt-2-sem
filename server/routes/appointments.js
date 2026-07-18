import { Router } from 'express';
import db from '../db.js';
import { randomUUID } from 'crypto';

const router = Router();

// GET /api/appointments?phone=9876543210&status=upcoming
router.get('/', async (req, res) => {
  try {
    const { phone, status } = req.query;
    
    let sql = 'SELECT * FROM appointments';
    const params = [];
    const conditions = [];

    if (phone) { conditions.push('patientPhone = ?'); params.push(phone); }
    if (status) { conditions.push('status = ?'); params.push(status); }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY createdAt DESC';

    const dbInstance = await db.getDB();
    const data = await dbInstance.all(sql, params);
    
    res.json({ success: true, data });
  } catch (err) {
    console.error('GET /api/appointments error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/appointments
router.post('/', async (req, res) => {
  const dbInstance = await db.getDB();
  try {
    const { patientName, patientPhone, doctorId, doctorName, doctorDept, date, slot, reason } = req.body;

    if (!patientName || !doctorId || !date || !slot) {
      return res.status(400).json({ success: false, error: 'patientName, doctorId, date and slot are required' });
    }

    await dbInstance.run('BEGIN EXCLUSIVE TRANSACTION');

    // Check slot conflict
    const conflict = await dbInstance.get(
      'SELECT id FROM appointments WHERE doctorId = ? AND date = ? AND slot = ? AND status = ?',
      [doctorId, date, slot, 'upcoming']
    );
    
    if (conflict) {
      await dbInstance.run('ROLLBACK');
      return res.status(409).json({ success: false, error: 'This time slot is already booked' });
    }

    const appt = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      patientName,
      patientPhone: patientPhone || '',
      doctorId,
      doctorName: doctorName || '',
      doctorDept: doctorDept || '',
      date,
      slot,
      reason: reason || '',
      status: 'upcoming',
    };

    await dbInstance.run(
      `INSERT INTO appointments (id, patientName, patientPhone, doctorId, doctorName, doctorDept, date, slot, reason, status, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [appt.id, appt.patientName, appt.patientPhone, appt.doctorId, appt.doctorName, appt.doctorDept, appt.date, appt.slot, appt.reason, appt.status, appt.createdAt]
    );

    await dbInstance.run('COMMIT');
    res.status(201).json({ success: true, data: appt });
  } catch (err) {
    try { await dbInstance.run('ROLLBACK'); } catch (e) {}
    console.error('POST /api/appointments error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/appointments/:id
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const dbInstance = await db.getDB();
    
    const existing = await dbInstance.get('SELECT * FROM appointments WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ success: false, error: 'Appointment not found' });

    const { status, date, slot } = req.body;
    const updates = [];
    const params = [];
    
    if (status) { updates.push('status = ?'); params.push(status); }
    if (date) { updates.push('date = ?'); params.push(date); }
    if (slot) { updates.push('slot = ?'); params.push(slot); }

    if (updates.length > 0) {
      params.push(id);
      await dbInstance.run(`UPDATE appointments SET ${updates.join(', ')} WHERE id = ?`, params);
    }
    
    const updated = await dbInstance.get('SELECT * FROM appointments WHERE id = ?', [id]);
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('PATCH /api/appointments/:id error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/appointments/:id — soft cancel
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const dbInstance = await db.getDB();
    
    const existing = await dbInstance.get('SELECT id FROM appointments WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ success: false, error: 'Appointment not found' });

    await dbInstance.run('UPDATE appointments SET status = ? WHERE id = ?', ['cancelled', id]);
    res.json({ success: true, message: 'Appointment cancelled' });
  } catch (err) {
    console.error('DELETE /api/appointments/:id error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
