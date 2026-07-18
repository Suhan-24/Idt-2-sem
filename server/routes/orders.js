import express from 'express';
import { randomUUID } from 'crypto';
import db from '../db.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const database = await db.getDB();
    const orders = await database.all('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, phone, address, pin, items, total } = req.body;
    
    if (!name || !phone || !address || !items) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const id = randomUUID();
    const status = 'processing';
    const created_at = new Date().toISOString();
    const itemsJson = JSON.stringify(items);

    const database = await db.getDB();
    await database.run(
      'INSERT INTO orders (id, name, phone, address, pin, items, total, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, phone, address, pin, itemsJson, total, status, created_at]
    );

    res.status(201).json({ id, name, status, created_at });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
