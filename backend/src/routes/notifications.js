const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM notifications WHERE company_id=$1 ORDER BY created_at DESC LIMIT 20',
      [req.company.id]
    );
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/read', auth, async (req, res) => {
  try {
    await db.query('UPDATE notifications SET is_read=true WHERE company_id=$1', [req.company.id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
