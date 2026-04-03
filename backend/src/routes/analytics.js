const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  const id = req.company.id;
  try {
    const [products, requests, negotiations, matches, company] = await Promise.all([
      db.query('SELECT COUNT(*) FROM products WHERE company_id=$1 AND is_active=true', [id]),
      db.query('SELECT COUNT(*) FROM requests WHERE requester_id=$1 OR receiver_id=$1', [id]),
      db.query('SELECT COUNT(*) FROM negotiations WHERE buyer_id=$1 OR seller_id=$1', [id]),
      db.query('SELECT COUNT(*) FROM matches WHERE company_id=$1', [id]),
      db.query('SELECT credibility_score FROM companies WHERE id=$1', [id]),
    ]);
    const completedDeals = await db.query(
      `SELECT COUNT(*) FROM negotiations WHERE (buyer_id=$1 OR seller_id=$1) AND status='deal_made'`, [id]
    );
    const activeNeg = await db.query(
      `SELECT COUNT(*) FROM negotiations WHERE (buyer_id=$1 OR seller_id=$1) AND status='active'`, [id]
    );
    res.json({
      total_products: parseInt(products.rows[0].count),
      total_requests: parseInt(requests.rows[0].count),
      total_negotiations: parseInt(negotiations.rows[0].count),
      completed_deals: parseInt(completedDeals.rows[0].count),
      active_negotiations: parseInt(activeNeg.rows[0].count),
      matches_found: parseInt(matches.rows[0].count),
      credibility_score: parseFloat(company.rows[0]?.credibility_score || 50),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
