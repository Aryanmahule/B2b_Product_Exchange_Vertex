-- SymbioTrade Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(100) NOT NULL,
  location VARCHAR(255),
  contact_person VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  needs TEXT,
  offerings TEXT,
  description TEXT,
  credibility_score DECIMAL(5,2) DEFAULT 50.0,
  profile_complete BOOLEAN DEFAULT false,
  avatar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  quantity VARCHAR(100),
  price DECIMAL(12,2),
  currency VARCHAR(10) DEFAULT 'USD',
  image_url VARCHAR(500),
  product_type VARCHAR(20) DEFAULT 'main' CHECK (product_type IN ('main', 'byproduct')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS negotiations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'deal_made', 'cancelled')),
  final_price DECIMAL(12,2),
  final_quantity VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  negotiation_id UUID REFERENCES negotiations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  offer_price DECIMAL(12,2),
  offer_quantity VARCHAR(100),
  message_type VARCHAR(20) DEFAULT 'message' CHECK (message_type IN ('message', 'offer', 'system')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rater_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  rated_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  negotiation_id UUID REFERENCES negotiations(id) ON DELETE SET NULL,
  score INTEGER CHECK (score BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(rater_id, negotiation_id)
);

CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  matched_company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  match_score DECIMAL(5,4),
  match_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(company_id, matched_company_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  title VARCHAR(255),
  message TEXT,
  type VARCHAR(50),
  is_read BOOLEAN DEFAULT false,
  reference_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_company ON products(company_id);
CREATE INDEX IF NOT EXISTS idx_requests_requester ON requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_requests_receiver ON requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_negotiation ON messages(negotiation_id);
CREATE INDEX IF NOT EXISTS idx_matches_company ON matches(company_id);
CREATE INDEX IF NOT EXISTS idx_notifications_company ON notifications(company_id);
