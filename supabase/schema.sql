-- Run this in your Supabase SQL editor

CREATE TYPE spot_category AS ENUM ('date', 'nightlife', 'day', 'meet');
CREATE TYPE spot_source   AS ENUM ('manual', 'maps_import', 'chat_import', 'ai_suggestion');
CREATE TYPE spot_status   AS ENUM ('active', 'closed', 'unvisited');

CREATE TABLE spots (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  category        spot_category NOT NULL,
  subcategory     text,
  area            text,
  description     text,
  vibe            text[] DEFAULT '{}',
  price_range     int CHECK (price_range BETWEEN 1 AND 4),
  google_maps_url text,
  coordinates     point,
  photos          text[] DEFAULT '{}',
  my_notes        text,
  source          spot_source DEFAULT 'manual',
  rating          int CHECK (rating BETWEEN 1 AND 5),
  status          spot_status DEFAULT 'unvisited',
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER spots_updated_at
  BEFORE UPDATE ON spots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS: public can only read active spots (no my_notes, no rating)
ALTER TABLE spots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_active"
  ON spots FOR SELECT
  USING (status = 'active');
