const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, process.env.UPLOAD_DIR || 'uploads'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/products - my products
router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM products WHERE company_id=$1 ORDER BY created_at DESC',
      [req.company.id]
    );
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/products - create product
router.post('/', auth, upload.single('image'), async (req, res) => {
  const { name, category, description, quantity, price, currency, product_type } = req.body;
  if (!name) return res.status(400).json({ error: 'Product name required' });
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;
  try {
    const result = await db.query(
      `INSERT INTO products (company_id, name, category, description, quantity, price, currency, image_url, product_type)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [req.company.id, name, category, description, quantity, price || null, currency || 'USD', image_url, product_type || 'main']
    );
    res.status(201).json(result.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/products/:id
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  const { name, category, description, quantity, price, product_type } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : undefined;
  try {
    const existing = await db.query('SELECT * FROM products WHERE id=$1 AND company_id=$2', [req.params.id, req.company.id]);
    if (!existing.rows.length) return res.status(404).json({ error: 'Not found' });
    const result = await db.query(
      `UPDATE products SET name=$1, category=$2, description=$3, quantity=$4, price=$5, product_type=$6
       ${image_url ? ', image_url=$8' : ''}
       WHERE id=$7 RETURNING *`,
      image_url
        ? [name, category, description, quantity, price || null, product_type, req.params.id, image_url]
        : [name, category, description, quantity, price || null, product_type, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/products/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('UPDATE products SET is_active=false WHERE id=$1 AND company_id=$2', [req.params.id, req.company.id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
