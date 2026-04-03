# SymbioTrade – AI B2B Exchange Platform

> A smart B2B marketplace where companies exchange products and industrial by-products, powered by an AI matching engine.

---

## About the Project

SymbioTrade is a full-stack web application that connects businesses looking to exchange raw materials, products, and industrial by-products. Instead of waste going to landfill, companies can find the right buyer or supplier through AI-powered matching.

The platform uses **TF-IDF cosine similarity** to analyze each company's needs and offerings, then ranks the most relevant partners at the top of their personalized feed — no manual searching required.

---

## Screenshots

### Login Page
![Login](screenshots/login.png)

### Register Page
![Register](screenshots/register.png)

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Marketplace
![Marketplace](screenshots/marketplace.png)

### AI Matches
![AI Matches](screenshots/ai-matches.png)

### My Products
![Products](screenshots/products.png)

### Exchange Requests
![Requests](screenshots/requests.png)

### Negotiation Chat
![Negotiation](screenshots/negotiation.png)

### Analytics
![Analytics](screenshots/analytics.png)

### Company Profile
![Company Profile](screenshots/company-profile.png)

---

## Features

- **Company Auth** — JWT-based register and login
- **Marketplace** — Browse all companies with search and industry/product filters
- **AI Matching Engine** — Personalized feed ranked by TF-IDF cosine similarity
- **Product Upload** — Add main products or by-products with images
- **Exchange Requests** — Send, accept, or reject B2B exchange requests
- **Negotiation Chat** — Real-time style chat with price and quantity offers
- **Credibility Score** — Trust score built from completed deals and activity
- **Analytics Dashboard** — Full activity overview per company
- **Notifications** — Real-time alerts for requests and messages

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, React Router v6 |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| Auth | JWT + bcryptjs |
| AI Engine | TF-IDF Cosine Similarity (custom, no external API) |
| File Upload | Multer |
| HTTP Client | Axios |
| Icons | Lucide React |

---

## Database Schema

```
companies → products
          → requests → negotiations → messages
          → matches
          → ratings
          → notifications
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 1. Clone the repo
```bash
git clone https://github.com/Aryanmahule/B2b_Product_Exchange_Vertex.git
cd B2b_Product_Exchange_Vertex
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set your PostgreSQL password and JWT secret
npm run seed
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm start
```

### 4. Open the app
Go to **http://localhost:3000**

---

## Demo Credentials

| Email | Password |
|-------|----------|
| john@greensteel.com | password123 |
| sarah@ecoplastics.com | password123 |
| mike@agriwaste.com | password123 |
| lisa@chemsynth.com | password123 |
| david@techrecycle.com | password123 |

---

## Environment Variables

Create `backend/.env` from `backend/.env.example`:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/symbiotrade
JWT_SECRET=your_secret_key_here
UPLOAD_DIR=uploads
```

---

## Project Structure

```
symbiotrade/
├── backend/
│   ├── src/
│   │   ├── ai/          # TF-IDF matching engine
│   │   ├── db/          # Schema, seed, connection
│   │   ├── middleware/  # JWT auth
│   │   └── routes/      # API endpoints
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/         # Axios instance
│   │   ├── components/  # Layout, CompanyCard
│   │   ├── context/     # Auth context
│   │   └── pages/       # All page components
│   └── package.json
└── screenshots/
```

---

## How AI Matching Works

1. Your company's `needs` text is vectorized using TF-IDF
2. Every other company's `offerings` text is vectorized
3. Cosine similarity scores how closely they match
4. The reverse is also scored (their needs vs your offerings)
5. Both scores are combined — companies with mutual benefit rank highest
6. Top 10 matches are saved and displayed on your AI Matches page

---

## License

MIT
