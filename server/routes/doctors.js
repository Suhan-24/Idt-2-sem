import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/doctors?dept=cardiology&q=ramesh&available=1
router.get('/', async (req, res) => {
  try {
    const { dept, q, available } = req.query;
    
    let sql = 'SELECT * FROM doctors';
    const params = [];
    const conditions = [];
    
    if (dept) { conditions.push('dept = ?'); params.push(dept); }
    if (available === '1') { conditions.push('available = 1'); }
    if (q) {
      // Use LIKE for case-insensitive search
      conditions.push('(name LIKE ? OR specialization LIKE ? OR bio LIKE ? OR dept LIKE ?)');
      const likeQ = `%${q}%`;
      params.push(likeQ, likeQ, likeQ, likeQ);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY rating DESC';

    const dbInstance = await db.getDB();
    let results = await dbInstance.all(sql, params);

    // Map SQLite types back to JS objects/booleans
    const data = results.map(d => ({
      ...d,
      languages: JSON.parse(d.languages || '[]'),
      available: d.available === 1
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error('GET /api/doctors error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/doctors/:id
router.get('/:id', async (req, res) => {
  try {
    const dbInstance = await db.getDB();
    const doc = await dbInstance.get('SELECT * FROM doctors WHERE id = ?', [req.params.id]);
    
    if (!doc) return res.status(404).json({ success: false, error: 'Doctor not found' });
    
    const data = {
      ...doc,
      languages: JSON.parse(doc.languages || '[]'),
      available: doc.available === 1
    };
    
    res.json({ success: true, data });
  } catch (err) {
    console.error('GET /api/doctors/:id error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
