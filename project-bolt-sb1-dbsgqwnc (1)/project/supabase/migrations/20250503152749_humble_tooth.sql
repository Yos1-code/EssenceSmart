/*
  # Sample Data for Essence Smart E-commerce

  1. Sample Data:
    - Adds sample perfumes
    - Adds sample tech devices
    - Adds sample medical electronics
*/

-- Insert sample perfumes
INSERT INTO products (name, description, price, category, subcategory, image_url, model_3d_url, stock, featured, discount_percent)
VALUES
  ('Moonlight Elixir', 'A captivating blend of jasmine, vanilla, and amber that evokes the mystery of moonlit nights.', 89.99, 'perfumes', 'women', 'https://images.pexels.com/photos/3973576/pexels-photo-3973576.jpeg', 'https://models.readyplayer.me/64fa0406d722cca229cbef98.glb', 100, true, NULL),
  ('Ocean Breeze', 'Fresh and invigorating with notes of sea salt, citrus, and cedarwood.', 75.99, 'perfumes', 'men', 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg', 'https://models.readyplayer.me/64fa0497030f6e98722e69c4.glb', 85, true, 10),
  ('Rose Enchantment', 'A romantic and timeless fragrance with the essence of Bulgarian roses and sweet vanilla.', 99.99, 'perfumes', 'women', 'https://images.pexels.com/photos/5864245/pexels-photo-5864245.jpeg', 'https://models.readyplayer.me/64fa0528c69b32972dbbd0f5.glb', 75, false, NULL),
  ('Midnight Oud', 'A deep and complex fragrance with oud, leather, and spices for a luxurious experience.', 120.99, 'perfumes', 'unisex', 'https://images.pexels.com/photos/3059609/pexels-photo-3059609.jpeg', 'https://models.readyplayer.me/64fa05ac7dd987a7a9e55feb.glb', 50, true, NULL),
  ('Citrus Splash', 'Energizing blend of lemon, bergamot, and grapefruit for a refreshing everyday scent.', 65.99, 'perfumes', 'unisex', 'https://images.pexels.com/photos/3765174/pexels-photo-3765174.jpeg', 'https://models.readyplayer.me/64fa061fd722cca229cbefb4.glb', 110, false, 15),
  ('Velvet Seduction', 'Rich and sensual with notes of black cherry, chocolate, and patchouli.', 110.99, 'perfumes', 'women', 'https://images.pexels.com/photos/4041391/pexels-photo-4041391.jpeg', 'https://models.readyplayer.me/64fa068ad722cca229cbefbe.glb', 60, true, NULL);

-- Insert sample tech devices
INSERT INTO products (name, description, price, category, subcategory, image_url, model_3d_url, stock, featured, discount_percent)
VALUES
  ('Smart Watch Pro', 'Advanced smartwatch with health monitoring, GPS, and 7-day battery life.', 249.99, 'tech', 'wearables', 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg', NULL, 45, true, NULL),
  ('Wireless Earbuds', 'Immersive sound quality with active noise cancellation and 30-hour battery life.', 129.99, 'tech', 'audio', 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg', NULL, 80, false, 5),
  ('Essence Tablet', '10.5-inch tablet with stunning display, powerful processor, and all-day battery.', 399.99, 'tech', 'tablets', 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg', NULL, 35, true, 10),
  ('Smart Home Hub', 'Control your entire smart home with voice commands and intuitive touch controls.', 179.99, 'tech', 'smart home', 'https://images.pexels.com/photos/1055329/pexels-photo-1055329.jpeg', NULL, 50, false, NULL),
  ('Ultra HD Camera Drone', 'Capture stunning aerial footage with 4K camera and 30-minute flight time.', 599.99, 'tech', 'cameras', 'https://images.pexels.com/photos/442587/pexels-photo-442587.jpeg', NULL, 25, true, NULL);

-- Insert sample medical electronics
INSERT INTO products (name, description, price, category, subcategory, image_url, model_3d_url, stock, featured, discount_percent)
VALUES
  ('Smart Blood Pressure Monitor', 'Accurate and easy-to-use digital blood pressure monitor with smartphone connectivity.', 89.99, 'medical', 'monitoring', 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg', NULL, 60, true, NULL),
  ('Digital Thermometer', 'Fast and precise temperature readings with fever alert and memory function.', 29.99, 'medical', 'diagnostics', 'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg', NULL, 100, false, NULL),
  ('Smart Scale', 'Tracks weight, BMI, body fat, and more with smartphone app integration.', 79.99, 'medical', 'wellness', 'https://images.pexels.com/photos/6740748/pexels-photo-6740748.jpeg', NULL, 55, true, 20),
  ('Pulse Oximeter', 'Easy-to-use device for measuring blood oxygen levels and pulse rate.', 49.99, 'medical', 'monitoring', 'https://images.pexels.com/photos/7992738/pexels-photo-7992738.jpeg', NULL, 70, false, NULL),
  ('Sleep Tracker', 'Advanced sleep monitoring device that tracks sleep patterns and quality.', 149.99, 'medical', 'wellness', 'https://images.pexels.com/photos/5699514/pexels-photo-5699514.jpeg', NULL, 40, true, 10);