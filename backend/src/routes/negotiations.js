const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

// GET /api/negotiations - list my negotiations
router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT n.*, 
              b.name as buyer_name, s.name as seller_name,
              r.product_id, p.name as product_name
       FROM negotiations n
       JOIN companies b ON b.id = n.buyer_id
       JOIN companies s ON s.id = n.seller_id
       JOIN requests r ON r.id = n.request_id
       LEFT JOIN products p ON p.id = r.product_id
       WHERE n.buyer_id=$1 OR n.seller_id=$1
       ORDER BY n.updated_at DESC`,
      [req.company.id]
    );
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/negotiations/:id - single negotiation with messages
router.get('/:id', auth, async (req, res) => {
  try {
    const negRes = await db.query(
      `SELECT n.*, 
              b.name as buyer_name, b.industry as buyer_industry,
              s.name as seller_name, s.industry as seller_industry,
              r.product_id, p.name as product_name, p.price as product_price
       FROM negotiations n
       JOIN companies b ON b.id = n.buyer_id
       JOIN companies s ON s.id = n.seller_id
       JOIN requests r ON r.id = n.request_id
       LEFT JOIN products p ON p.id = r.product_id
       WHERE n.id=$1 AND (n.buyer_id=$2 OR n.seller_id=$2)`,
      [req.params.id, req.company.id]
    );
    if (!negRes.rows.length) return res.status(404).json({ error: 'Not found' });

    const msgRes = await db.query(
      `SELECT m.*, c.name as sender_name
       FROM messages m
       JOIN companies c ON c.id = m.sender_id
       WHERE m.negotiation_id=$1
       ORDER BY m.created_at ASC`,
      [req.params.id]
    );

    res.json({ ...negRes.rows[0], messages: msgRes.rows });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/negotiations/:id/messages - send message or offer
router.post('/:id/messages', auth, async (req, res) => {
  const { content, offer_price, offer_quantity, message_type } = req.body;
  if (!content) return res.status(400).json({ error: 'Content required' });
  try {
    const neg = await db.query(
      'SELECT * FROM negotiations WHERE id=$1 AND (buyer_id=$2 OR seller_id=$2)',
      [req.params.id, req.company.id]
    );
    if (!neg.rows.length) return res.status(404).json({ error: 'Not found' });
    if (neg.rows[0].status !== 'active') return res.status(400).json({ error: 'Negotiation is closed' });

    const result = await db.query(
      `INSERT INTO messages (negotiation_id, sender_id, content, offer_price, offer_quantity, message_type)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.params.id, req.company.id, content, offer_price || null, offer_quantity || null, message_type || 'message']
    );

    await db.query('UPDATE negotiations SET updated_at=NOW() WHERE id=$1', [req.params.id]);

    // Notify other party
    const otherId = neg.rows[0].buyer_id === req.company.id ? neg.rows[0].seller_id : neg.rows[0].buyer_id;
    await db.query(
      `INSERT INTO notifications (company_id, title, message, type, reference_id)
       VALUES ($1,'New Message','You have a new message in a negotiation','message',$2)`,
      [otherId, req.params.id]
    );

    const withSender = await db.query(
      'SELECT m.*, c.name as sender_name FROM messages m JOIN companies c ON c.id=m.sender_id WHERE m.id=$1',
      [result.rows[0].id]
    );
    res.status(201).json(withSender.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/negotiations/:id/deal - accept deal
router.put('/:id/deal', auth, async (req, res) => {
  const { action, final_price, final_quantity } = req.body;
  try {
    const neg = await db.query(
      'SELECT * FROM negotiations WHERE id=$1 AND (buyer_id=$2 OR seller_id=$2)',
      [req.params.id, req.company.id]
    );
    if (!neg.rows.length) return res.status(404).json({ error: 'Not found' });

    if (action === 'accept') {
      await db.query(
        `UPDATE negotiations SET status='deal_made', final_price=$1, final_quantity=$2, updated_at=NOW() WHERE id=$3`,
        [final_price || null, final_quantity || null, req.params.id]
      );
      await db.query(
        `UPDATE requests SET status='completed', updated_at=NOW() WHERE id=$1`,
        [neg.rows[0].request_id]
      );
      // Update credibility scores
      await db.query(
        `UPDATE companies SET credibility_score = LEAST(100, credibility_score + 2) WHERE id IN ($1,$2)`,
        [neg.rows[0].buyer_id, neg.rows[0].seller_id]
      );
    } else if (action === 'cancel') {
      await db.query(`UPDATE negotiations SET status='cancelled', updated_at=NOW() WHERE id=$1`, [req.params.id]);
    }

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
