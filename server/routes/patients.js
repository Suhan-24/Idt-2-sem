import { Router } from 'express';
import db from '../db.js';
import { randomUUID } from 'crypto';

const router = Router();

// GET /api/patients?phone=9876543210
router.get('/', async (req, res) => {
  try {
    const { phone } = req.query;
    
    let sql = 'SELECT * FROM patients';
    const params = [];
    
    if (phone) {
      sql += ' WHERE phone = ?';
      params.push(phone);
    }

    const dbInstance = await db.getDB();
    const data = await dbInstance.all(sql, params);

    res.json({ success: true, data });
  } catch (err) {
    console.error('GET /api/patients error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/patients
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, dob, blood_group } = req.body;
    
    if (!name || !phone) {
      return res.status(400).json({ success: false, error: 'Name and phone are required' });
    }

    const dbInstance = await db.getDB();
    
    const existing = await dbInstance.get('SELECT id FROM patients WHERE phone = ?', [phone]);
    if (existing) {
      return res.status(409).json({ success: false, error: 'Patient with this phone already exists' });
    }

    const patient = {
      id: randomUUID(),
      name,
      phone,
      email: email || '',
      dob: dob || '',
      blood_group: blood_group || '',
      created_at: new Date().toISOString()
    };

    await dbInstance.run(
      `INSERT INTO patients (id, name, phone, email, dob, blood_group, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [patient.id, patient.name, patient.phone, patient.email, patient.dob, patient.blood_group, patient.created_at]
    );
    
    res.status(201).json({ success: true, data: patient });
  } catch (err) {
    console.error('POST /api/patients error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
