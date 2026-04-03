const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const { rankMatches } = require('../ai/matcher');
const router = express.Router();

// GET /api/companies - marketplace listing
router.get('/', auth, async (req, res) => {
  const { search, industry, product_type } = req.query;
  try {
    let query = `
      SELECT c.id, c.name, c.industry, c.location, c.description, c.credibility_score, c.needs, c.offerings,
             json_agg(DISTINCT jsonb_build_object('id',p.id,'name',p.name,'category',p.category,'product_type',p.product_type,'price',p.price)) 
               FILTER (WHERE p.id IS NOT NULL) as products
      FROM companies c
      LEFT JOIN products p ON p.company_id = c.id AND p.is_active = true
      WHERE c.id != $1
    `;
    const params = [req.company.id];
    let idx = 2;

    if (search) {
      query += ` AND (c.name ILIKE $${idx} OR c.industry ILIKE $${idx} OR c.offerings ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }
    if (industry) {
      query += ` AND c.industry ILIKE $${idx}`;
      params.push(`%${industry}%`);
      idx++;
    }
    if (product_type) {
      query += ` AND p.product_type = $${idx}`;
      params.push(product_type);
      idx++;
    }

    query += ' GROUP BY c.id ORDER BY c.credibility_score DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/companies/me - current company profile
router.get('/me', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, name, industry, location, contact_person, email, needs, offerings, description, credibility_score, profile_complete, avatar_url, created_at
       FROM companies WHERE id=$1`,
      [req.company.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/companies/me - update profile
router.put('/me', auth, async (req, res) => {
  const { name, industry, location, contact_person, needs, offerings, description } = req.body;
  try {
    const result = await db.query(
      `UPDATE companies SET name=$1, industry=$2, location=$3, contact_person=$4, needs=$5, offerings=$6, description=$7,
       profile_complete=($5 IS NOT NULL AND $6 IS NOT NULL), updated_at=NOW()
       WHERE id=$8 RETURNING id, name, industry, location, contact_person, email, needs, offerings, description, credibility_score, profile_complete`,
      [name, industry, location, contact_person, needs, offerings, description, req.company.id]
    );
    res.json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/companies/matches - AI matches for current user
router.get('/matches', auth, async (req, res) => {
  try {
    const meRes = await db.query('SELECT * FROM companies WHERE id=$1', [req.company.id]);
    const me = meRes.rows[0];

    const allRes = await db.query(`
      SELECT c.*, string_agg(p.name || ' ' || COALESCE(p.description,''), ' ') as product_names
      FROM companies c
      LEFT JOIN products p ON p.company_id = c.id AND p.is_active = true
      WHERE c.id != $1
      GROUP BY c.id
    `, [req.company.id]);

    const ranked = rankMatches(me, allRes.rows);

    // Persist top matches
    for (const m of ranked.slice(0, 10)) {
      await db.query(
        `INSERT INTO matches (company_id, matched_company_id, match_score)
         VALUES ($1,$2,$3) ON CONFLICT (company_id, matched_company_id) DO UPDATE SET match_score=$3`,
        [req.company.id, m.company.id, m.score]
      );
    }

    res.json(ranked.slice(0, 10).map((m) => ({
      ...m.company,
      match_score: m.score,
      needs_score: m.needsScore,
      offerings_score: m.offeringsScore,
    })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/companies/:id - single company profile
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.id, c.name, c.industry, c.location, c.contact_person, c.description, c.credibility_score, c.needs, c.offerings, c.created_at,
              json_agg(DISTINCT jsonb_build_object('id',p.id,'name',p.name,'category',p.category,'description',p.description,'quantity',p.quantity,'price',p.price,'product_type',p.product_type,'image_url',p.image_url))
                FILTER (WHERE p.id IS NOT NULL) as products
       FROM companies c
       LEFT JOIN products p ON p.company_id = c.id AND p.is_active = true
       WHERE c.id=$1
       GROUP BY c.id`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
