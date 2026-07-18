-- Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Create the products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Sneakers', 'Classic', 'Boots')),
  image_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read products (public shop)
CREATE POLICY "Public read access" ON products
  FOR SELECT USING (true);

-- Allow authenticated users to insert products
CREATE POLICY "Authenticated insert" ON products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update products
CREATE POLICY "Authenticated update" ON products
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete products
CREATE POLICY "Authenticated delete" ON products
  FOR DELETE USING (auth.role() = 'authenticated');

-- Optional: insert some seed data
INSERT INTO products (name, price, category, image_url) VALUES
  ('Nebula Runner', 129.99, 'Sneakers', ''),
  ('Orbit High-Top', 159.99, 'Sneakers', ''),
  ('Galaxy Glide', 119.99, 'Sneakers', ''),
  ('Stellar Oxford', 189.99, 'Classic', ''),
  ('Cosmic Derby', 149.99, 'Classic', ''),
  ('Lunar Loafer', 139.99, 'Classic', ''),
  ('Comet Boot', 219.99, 'Boots', ''),
  ('Asteroid Hiker', 199.99, 'Boots', ''),
  ('Meteor Work Boot', 249.99, 'Boots', '');
