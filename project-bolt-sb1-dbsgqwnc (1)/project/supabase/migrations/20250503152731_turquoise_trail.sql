/*
  # Initial Schema for Essence Smart E-commerce

  1. New Tables
    - `profiles`: Stores user profile information
    - `products`: Stores product information
    - `product_likes`: Tracks products liked by users
    - `cart_items`: Tracks items in user carts
    - `orders`: Tracks user orders
    - `order_items`: Tracks items in each order

  2. Security
    - Enable RLS on all tables
    - Define policies for authenticated users
*/

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  full_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  image_url TEXT NOT NULL,
  model_3d_url TEXT,
  stock INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  discount_percent INTEGER
);

-- Product likes table
CREATE TABLE IF NOT EXISTS product_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE(user_id, product_id)
);

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  UNIQUE(user_id, product_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  total DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT NOT NULL,
  shipping_address JSONB NOT NULL
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT now(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL
);

-- Set up Row Level Security (RLS)
-- Profiles: users can read all profiles, but only update their own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by users"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Products: anyone can view products, only admins can modify
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Admins can modify products"
  ON products FOR ALL
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()));

-- Product likes: users can manage their own likes
ALTER TABLE product_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own likes"
  ON product_likes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own likes"
  ON product_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own likes"
  ON product_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Cart items: users can manage their own cart
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cart"
  ON cart_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add items to their cart"
  ON cart_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update items in their cart"
  ON cart_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can remove items from their cart"
  ON cart_items FOR DELETE
  USING (auth.uid() = user_id);

-- Orders: users can view and create their own orders, admins can view all
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id OR (SELECT is_admin FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create their own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()));

-- Order items: users can view their own order items, admins can view all
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own order items"
  ON order_items FOR SELECT
  USING ((SELECT user_id FROM orders WHERE id = order_id) = auth.uid() 
         OR (SELECT is_admin FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create their own order items"
  ON order_items FOR INSERT
  WITH CHECK ((SELECT user_id FROM orders WHERE id = order_id) = auth.uid());

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true);
-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);