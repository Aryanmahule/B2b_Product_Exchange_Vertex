const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, industry, location, contact_person, email, password, needs, offerings } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password required' });
  try {
    const exists = await db.query('SELECT id FROM companies WHERE email=$1', [email]);
    if (exists.rows.length) return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const result = await db.query(
      `INSERT INTO companies (name, industry, location, contact_person, email, password_hash, needs, offerings, profile_complete)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id, name, email, industry, location, credibility_score`,
      [name, industry, location, contact_person, email, hash, needs, offerings, !!(needs && offerings)]
    );
    const company = result.rows[0];
    const token = jwt.sign({ id: company.id, email: company.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, company });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const result = await db.query('SELECT * FROM companies WHERE email=$1', [email]);
    if (!result.rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    const company = result.rows[0];
    const valid = await bcrypt.compare(password, company.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: company.id, email: company.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const { password_hash, ...safe } = company;
    res.json({ token, company: safe });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
