import express from 'express';
import { randomUUID } from 'crypto';
import db from '../db.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const database = await db.getDB();
    const consultations = await database.all('SELECT * FROM video_consultations ORDER BY created_at DESC');
    res.json(consultations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { doctor_name, department, date, slot, upi_id } = req.body;
    
    if (!doctor_name || !slot || !upi_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const id = randomUUID();
    const status = 'scheduled';
    const created_at = new Date().toISOString();

    const database = await db.getDB();
    await database.run(
      'INSERT INTO video_consultations (id, doctor_name, department, date, slot, upi_id, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, doctor_name, department, date, slot, upi_id, status, created_at]
    );

    res.status(201).json({ id, status, created_at });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
