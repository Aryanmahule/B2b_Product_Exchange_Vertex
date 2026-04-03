require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./index');
const fs = require('fs');
const path = require('path');

async function seed() {
  console.log('Running schema...');
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await db.query(schema);

  console.log('Seeding companies...');
  const password = await bcrypt.hash('password123', 10);

  const companies = [
    {
      name: 'GreenSteel Corp',
      industry: 'Manufacturing',
      location: 'Pittsburgh, PA',
      contact: 'John Smith',
      email: 'john@greensteel.com',
      needs: 'scrap metal recycled aluminum industrial waste',
      offerings: 'steel beams metal sheets structural components',
      description: 'Leading steel manufacturer with 30 years of experience.',
      score: 87.5,
    },
    {
      name: 'EcoPlastics Ltd',
      industry: 'Plastics & Recycling',
      location: 'Houston, TX',
      contact: 'Sarah Johnson',
      email: 'sarah@ecoplastics.com',
      needs: 'plastic waste PET bottles industrial plastic scraps',
      offerings: 'recycled plastic pellets eco packaging biodegradable materials',
      description: 'Turning plastic waste into valuable materials.',
      score: 92.0,
    },
    {
      name: 'AgriWaste Solutions',
      industry: 'Agriculture',
      location: 'Des Moines, IA',
      contact: 'Mike Davis',
      email: 'mike@agriwaste.com',
      needs: 'organic fertilizer compost agricultural chemicals',
      offerings: 'crop residue biomass organic waste compost',
      description: 'Converting agricultural waste into sustainable products.',
      score: 78.3,
    },
    {
      name: 'ChemSynth Industries',
      industry: 'Chemicals',
      location: 'Baton Rouge, LA',
      contact: 'Lisa Chen',
      email: 'lisa@chemsynth.com',
      needs: 'biomass organic compounds raw chemicals',
      offerings: 'chemical byproducts solvents industrial chemicals',
      description: 'Specialty chemical manufacturer and recycler.',
      score: 83.7,
    },
    {
      name: 'TechRecycle Hub',
      industry: 'Electronics',
      location: 'San Jose, CA',
      contact: 'David Park',
      email: 'david@techrecycle.com',
      needs: 'electronic waste circuit boards rare earth metals',
      offerings: 'refurbished components copper wire precious metals',
      description: 'E-waste recycling and component recovery specialists.',
      score: 95.1,
    },
    {
      name: 'WoodCraft Timber',
      industry: 'Forestry & Wood',
      location: 'Portland, OR',
      contact: 'Emma Wilson',
      email: 'emma@woodcraft.com',
      needs: 'wood chips sawdust timber offcuts',
      offerings: 'lumber planks wood pellets sawdust biomass',
      description: 'Sustainable timber processing and wood products.',
      score: 81.2,
    },
  ];

  const companyIds = [];
  for (const c of companies) {
    const res = await db.query(
      `INSERT INTO companies (name, industry, location, contact_person, email, password_hash, needs, offerings, description, credibility_score, profile_complete)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,true)
       ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
      [c.name, c.industry, c.location, c.contact, c.email, password, c.needs, c.offerings, c.description, c.score]
    );
    companyIds.push(res.rows[0].id);
  }

  console.log('Seeding products...');
  const products = [
    { cIdx: 0, name: 'Steel Beams Grade A', category: 'Metals', desc: 'High-grade structural steel beams', qty: '500 tons', price: 850, type: 'main' },
    { cIdx: 0, name: 'Metal Shavings', category: 'Metals', desc: 'Steel shavings from manufacturing process', qty: '50 tons/month', price: 120, type: 'byproduct' },
    { cIdx: 1, name: 'Recycled PET Pellets', category: 'Plastics', desc: 'High-quality recycled PET plastic pellets', qty: '200 tons', price: 450, type: 'main' },
    { cIdx: 1, name: 'Plastic Offcuts', category: 'Plastics', desc: 'Mixed plastic offcuts from production', qty: '30 tons/month', price: 80, type: 'byproduct' },
    { cIdx: 2, name: 'Organic Compost', category: 'Agriculture', desc: 'Rich organic compost from crop residue', qty: '1000 tons', price: 95, type: 'main' },
    { cIdx: 2, name: 'Crop Biomass', category: 'Agriculture', desc: 'Dried crop residue for energy production', qty: '500 tons/season', price: 60, type: 'byproduct' },
    { cIdx: 3, name: 'Industrial Solvents', category: 'Chemicals', desc: 'Recovered industrial solvents, purified', qty: '10,000 liters', price: 2.5, type: 'main' },
    { cIdx: 3, name: 'Chemical Byproducts', category: 'Chemicals', desc: 'Various chemical byproducts from synthesis', qty: 'Varies', price: null, type: 'byproduct' },
    { cIdx: 4, name: 'Recovered Copper Wire', category: 'Electronics', desc: 'High-purity copper wire from e-waste', qty: '5 tons', price: 6500, type: 'main' },
    { cIdx: 4, name: 'Circuit Board Scraps', category: 'Electronics', desc: 'PCB scraps with recoverable metals', qty: '2 tons/month', price: 1200, type: 'byproduct' },
    { cIdx: 5, name: 'Premium Lumber', category: 'Wood', desc: 'Kiln-dried premium lumber planks', qty: '10,000 board feet', price: 3.2, type: 'main' },
    { cIdx: 5, name: 'Wood Pellets', category: 'Wood', desc: 'Compressed wood pellets for biomass energy', qty: '200 tons', price: 180, type: 'byproduct' },
  ];

  for (const p of products) {
    await db.query(
      `INSERT INTO products (company_id, name, category, description, quantity, price, product_type)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [companyIds[p.cIdx], p.name, p.category, p.desc, p.qty, p.price, p.type]
    );
  }

  console.log('Seeding requests & negotiations...');
  const reqRes = await db.query(
    `INSERT INTO requests (requester_id, receiver_id, message, status)
     VALUES ($1,$2,$3,'accepted') RETURNING id`,
    [companyIds[0], companyIds[1], 'Interested in your recycled plastic pellets for our packaging division.']
  );
  const negRes = await db.query(
    `INSERT INTO negotiations (request_id, buyer_id, seller_id, status)
     VALUES ($1,$2,$3,'active') RETURNING id`,
    [reqRes.rows[0].id, companyIds[0], companyIds[1]]
  );
  const negId = negRes.rows[0].id;
  await db.query(
    `INSERT INTO messages (negotiation_id, sender_id, content, offer_price, message_type)
     VALUES ($1,$2,$3,$4,'offer')`,
    [negId, companyIds[0], 'We can offer $400/ton for 100 tons of PET pellets.', 400]
  );
  await db.query(
    `INSERT INTO messages (negotiation_id, sender_id, content, offer_price, message_type)
     VALUES ($1,$2,$3,$4,'offer')`,
    [negId, companyIds[1], 'We can do $430/ton for that quantity. Final offer.', 430]
  );

  // Seed matches
  for (let i = 0; i < companyIds.length; i++) {
    for (let j = 0; j < companyIds.length; j++) {
      if (i !== j) {
        const score = Math.random() * 0.5 + 0.3;
        await db.query(
          `INSERT INTO matches (company_id, matched_company_id, match_score)
           VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
          [companyIds[i], companyIds[j], score.toFixed(4)]
        );
      }
    }
  }

  console.log('Seed complete.');
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
