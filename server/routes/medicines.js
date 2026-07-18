import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { q, category } = req.query;
    
    let sql = 'SELECT * FROM medicines';
    const params = [];
    const conditions = [];
    
    if (category) { conditions.push('category = ?'); params.push(category); }
    if (q) {
      conditions.push('(name LIKE ? OR description LIKE ?)');
      const likeQ = `%${q}%`;
      params.push(likeQ, likeQ);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    const dbInstance = await db.getDB();
    let results = await dbInstance.all(sql, params);

    const data = results.map(d => ({
      ...d,
      prescription_required: d.prescription_required === 1
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error('GET /api/medicines error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const dbInstance = await db.getDB();
    const doc = await dbInstance.get('SELECT * FROM medicines WHERE id = ?', [req.params.id]);
    
    if (!doc) return res.status(404).json({ success: false, error: 'Medicine not found' });
    
    const data = {
      ...doc,
      prescription_required: doc.prescription_required === 1
    };
    
    res.json({ success: true, data });
  } catch (err) {
    console.error('GET /api/medicines/:id error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
