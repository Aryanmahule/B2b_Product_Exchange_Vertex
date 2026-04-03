const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

// GET /api/requests - all requests for current company
router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT r.*, 
              req.name as requester_name, req.industry as requester_industry,
              rec.name as receiver_name, rec.industry as receiver_industry,
              p.name as product_name
       FROM requests r
       JOIN companies req ON req.id = r.requester_id
       JOIN companies rec ON rec.id = r.receiver_id
       LEFT JOIN products p ON p.id = r.product_id
       WHERE r.requester_id=$1 OR r.receiver_id=$1
       ORDER BY r.created_at DESC`,
      [req.company.id]
    );
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/requests - send exchange request
router.post('/', auth, async (req, res) => {
  const { receiver_id, product_id, message } = req.body;
  if (!receiver_id) return res.status(400).json({ error: 'Receiver required' });
  try {
    const result = await db.query(
      `INSERT INTO requests (requester_id, receiver_id, product_id, message)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [req.company.id, receiver_id, product_id || null, message]
    );
    // Notify receiver
    await db.query(
      `INSERT INTO notifications (company_id, title, message, type, reference_id)
       VALUES ($1,'New Exchange Request','You have a new exchange request','request',$2)`,
      [receiver_id, result.rows[0].id]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/requests/:id - accept/reject
router.put('/:id', auth, async (req, res) => {
  const { status } = req.body;
  if (!['accepted', 'rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  try {
    const reqRes = await db.query('SELECT * FROM requests WHERE id=$1 AND receiver_id=$2', [req.params.id, req.company.id]);
    if (!reqRes.rows.length) return res.status(404).json({ error: 'Not found' });

    await db.query('UPDATE requests SET status=$1, updated_at=NOW() WHERE id=$2', [status, req.params.id]);

    let negotiation = null;
    if (status === 'accepted') {
      const negRes = await db.query(
        `INSERT INTO negotiations (request_id, buyer_id, seller_id)
         VALUES ($1,$2,$3) RETURNING *`,
        [req.params.id, reqRes.rows[0].requester_id, req.company.id]
      );
      negotiation = negRes.rows[0];
      await db.query(
        `INSERT INTO notifications (company_id, title, message, type, reference_id)
         VALUES ($1,'Request Accepted','Your exchange request was accepted. Start negotiating!','negotiation',$2)`,
        [reqRes.rows[0].requester_id, negotiation.id]
      );
    }

    res.json({ status, negotiation });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
