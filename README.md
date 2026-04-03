# SymbioTrade – AI B2B Exchange Platform

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your PostgreSQL credentials
npm run seed      # Creates tables + seeds demo data
npm run dev       # Starts API on port 5000
```

### Frontend

```bash
cd frontend
npm install
npm start         # Starts React app on port 3000
```

### Demo Login
- Email: `john@greensteel.com`
- Password: `password123`

Other demo accounts: `sarah@ecoplastics.com`, `mike@agriwaste.com`, `lisa@chemsynth.com`, `david@techrecycle.com`, `emma@woodcraft.com` — all use `password123`.

## Features
- JWT authentication
- AI matching via TF-IDF cosine similarity
- B2B exchange requests with accept/reject
- Real-time negotiation chat with price/quantity offers
- Credibility scoring system
- Product upload with image support
- Analytics dashboard
- Notifications
