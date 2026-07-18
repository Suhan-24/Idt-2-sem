import express from 'express';
import { randomUUID } from 'crypto';
import db from '../db.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const database = await db.getDB();
    const emergencies = await database.all('SELECT * FROM emergencies ORDER BY created_at DESC');
    res.json(emergencies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { location, driver_id, driver_name } = req.body;
    
    if (!location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const id = randomUUID();
    const status = 'dispatched';
    const created_at = new Date().toISOString();

    const database = await db.getDB();
    await database.run(
      'INSERT INTO emergencies (id, location, driver_id, driver_name, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [id, location, driver_id || null, driver_name || null, status, created_at]
    );

    res.status(201).json({ id, status, created_at });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
