import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET /api/reminders?phone=1234567890
router.get('/', async (req, res) => {
  try {
    const { phone } = req.query;
    const database = await db.getDB();
    let query = 'SELECT * FROM reminders';
    const params = [];
    
    if (phone) {
      query = 'SELECT * FROM reminders WHERE patientPhone = ?';
      params.push(phone);
    }
    
    const records = await database.all(query, params);
    res.json({ success: true, data: records });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch reminders' });
  }
});

// POST /api/reminders
router.post('/', async (req, res) => {
  try {
    const { patientPhone, tablet, dosage, time, frequency, notes, taken } = req.body;
    if (!patientPhone || !tablet || !time) {
      return res.status(400).json({ success: false, error: 'patientPhone, tablet, and time are required' });
    }

    const id = Date.now().toString();
    const database = await db.getDB();
    
    await database.run(
      'INSERT INTO reminders (id, patientPhone, tablet, dosage, time, frequency, notes, taken) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, patientPhone, tablet, dosage || '', time, frequency || '', notes || '', taken ? 1 : 0]
    );
    
    const newRecord = await database.get('SELECT * FROM reminders WHERE id = ?', [id]);
    res.json({ success: true, data: newRecord });
  } catch (error) {
    console.error('Error uploading reminder:', error);
    res.status(500).json({ success: false, error: 'Failed to upload reminder' });
  }
});

// PATCH /api/reminders/:id
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { taken } = req.body;
    
    const database = await db.getDB();
    await database.run('UPDATE reminders SET taken = ? WHERE id = ?', [taken ? 1 : 0, id]);
    
    const updatedRecord = await database.get('SELECT * FROM reminders WHERE id = ?', [id]);
    res.json({ success: true, data: updatedRecord });
  } catch (error) {
    console.error('Error updating reminder:', error);
    res.status(500).json({ success: false, error: 'Failed to update reminder' });
  }
});

// DELETE /api/reminders/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const database = await db.getDB();
    await database.run('DELETE FROM reminders WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    res.status(500).json({ success: false, error: 'Failed to delete reminder' });
  }
});

export default router;
