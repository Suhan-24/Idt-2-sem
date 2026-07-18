import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET /api/records?phone=1234567890
router.get('/', async (req, res) => {
  try {
    const { phone } = req.query;
    const database = await db.getDB();
    let query = 'SELECT * FROM medical_records ORDER BY date DESC';
    const params = [];
    
    if (phone) {
      query = 'SELECT * FROM medical_records WHERE patientPhone = ? ORDER BY date DESC';
      params.push(phone);
    }
    
    const records = await database.all(query, params);
    res.json({ success: true, data: records });
  } catch (error) {
    console.error('Error fetching medical records:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch medical records' });
  }
});

// POST /api/records
router.post('/', async (req, res) => {
  try {
    const { patientPhone, name, type, date, size } = req.body;
    if (!patientPhone || !name) {
      return res.status(400).json({ success: false, error: 'patientPhone and name are required' });
    }

    const id = Date.now().toString();
    const database = await db.getDB();
    
    await database.run(
      'INSERT INTO medical_records (id, patientPhone, name, type, date, size) VALUES (?, ?, ?, ?, ?, ?)',
      [id, patientPhone, name, type || 'Document', date || new Date().toISOString().split('T')[0], size || 'Unknown']
    );
    
    const newRecord = await database.get('SELECT * FROM medical_records WHERE id = ?', [id]);
    res.json({ success: true, data: newRecord });
  } catch (error) {
    console.error('Error uploading medical record:', error);
    res.status(500).json({ success: false, error: 'Failed to upload medical record' });
  }
});

// DELETE /api/records/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const database = await db.getDB();
    await database.run('DELETE FROM medical_records WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting medical record:', error);
    res.status(500).json({ success: false, error: 'Failed to delete medical record' });
  }
});

export default router;
