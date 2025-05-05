/*
  # Sample Data for Essence Smart E-commerce

  1. Sample Data:
    - Adds sample perfumes with 3D models
    - Adds sample tech devices
    - Adds sample medical electronics
*/

-- Insert sample perfumes with 3D models
INSERT INTO products (name, description, price, category, subcategory, image_url, model_3d_url, stock, featured, discount_percent)
VALUES
  ('Moonlight Elixir', 'A captivating blend of jasmine, vanilla, and amber that evokes the mystery of moonlit nights. Top notes of bergamot and jasmine, heart notes of vanilla orchid, and base notes of amber and musk create an unforgettable sensory experience.', 89.99, 'perfumes', 'women', 'https://images.pexels.com/photos/3973576/pexels-photo-3973576.jpeg', 'https://d1a370nemizbjq.cloudfront.net/283cf19b-51ce-4fde-b241-d449337871f5.glb', 100, true, NULL),
  ('Ocean Breeze', 'Fresh and invigorating with notes of sea salt, citrus, and cedarwood. This aquatic fragrance captures the essence of a coastal morning with hints of marine accord and fresh citrus.', 75.99, 'perfumes', 'men', 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg', 'https://d1a370nemizbjq.cloudfront.net/50ef7f5f-b401-4b47-a8dc-1c4eda1ba8d9.glb', 85, true, 10),
  ('Rose Enchantment', 'A romantic and timeless fragrance with the essence of Bulgarian roses and sweet vanilla. Complemented by peony and lily of the valley for a truly enchanting experience.', 99.99, 'perfumes', 'women', 'https://images.pexels.com/photos/5864245/pexels-photo-5864245.jpeg', 'https://d1a370nemizbjq.cloudfront.net/b6cad62d-32b4-4475-82da-e7d46a7f4b42.glb', 75, false, NULL),
  ('Midnight Oud', 'A deep and complex fragrance with oud, leather, and spices for a luxurious experience. Rich amber and exotic spices create an aura of mystery and sophistication.', 120.99, 'perfumes', 'unisex', 'https://images.pexels.com/photos/3059609/pexels-photo-3059609.jpeg', 'https://d1a370nemizbjq.cloudfront.net/2355b6d3-6c8b-4d27-b6b1-3634dc3c6f8a.glb', 50, true, NULL),
  ('Citrus Splash', 'Energizing blend of lemon, bergamot, and grapefruit for a refreshing everyday scent. Zesty top notes combine with subtle floral undertones for perfect balance.', 65.99, 'perfumes', 'unisex', 'https://images.pexels.com/photos/3765174/pexels-photo-3765174.jpeg', 'https://d1a370nemizbjq.cloudfront.net/5a049d94-8738-4c4b-a0c3-c67a4e6a35c6.glb', 110, false, 15),
  ('Velvet Seduction', 'Rich and sensual with notes of black cherry, chocolate, and patchouli. A seductive blend that leaves an unforgettable impression.', 110.99, 'perfumes', 'women', 'https://images.pexels.com/photos/4041391/pexels-photo-4041391.jpeg', 'https://d1a370nemizbjq.cloudfront.net/7e3cc859-356f-4764-8964-9a82b0c2a32e.glb', 60, true, NULL);

-- Update existing tech devices with more detailed descriptions
UPDATE products 
SET description = CASE 
  WHEN name = 'Smart Watch Pro' THEN 'Advanced smartwatch featuring continuous heart rate monitoring, SpO2 tracking, and built-in GPS. With a vibrant AMOLED display and 7-day battery life, stay connected and healthy in style.'
  WHEN name = 'Wireless Earbuds' THEN 'Premium wireless earbuds with active noise cancellation and spatial audio. Experience crystal-clear sound quality and seamless device switching with 30-hour total battery life.'
  WHEN name = 'Essence Tablet' THEN '10.5-inch tablet featuring a stunning 2K display and powerful octa-core processor. Perfect for productivity and entertainment with all-day battery life.'
  WHEN name = 'Smart Home Hub' THEN 'Central command for your smart home with voice control and intuitive touch interface. Supports multiple protocols for seamless integration with your favorite devices.'
  WHEN name = 'Ultra HD Camera Drone' THEN 'Professional-grade drone with 4K camera stabilization and intelligent flight modes. Capture breathtaking aerial footage with 30-minute flight time.'
  ELSE description
END
WHERE category = 'tech';

-- Update medical electronics with enhanced descriptions
UPDATE products 
SET description = CASE 
  WHEN name = 'Smart Blood Pressure Monitor' THEN 'Clinical-grade blood pressure monitor with smartphone connectivity and trend analysis. Features irregular heartbeat detection and multi-user support.'
  WHEN name = 'Digital Thermometer' THEN 'Advanced infrared thermometer with instant readings and fever alert system. Stores up to 32 measurements with time stamps.'
  WHEN name = 'Smart Scale' THEN 'Comprehensive body composition analyzer tracking 13 metrics including weight, BMI, body fat, and muscle mass. Syncs wirelessly with your fitness apps.'
  WHEN name = 'Pulse Oximeter' THEN 'Medical-grade pulse oximeter for accurate SpO2 and pulse rate measurements. Perfect for health monitoring and sports activities.'
  WHEN name = 'Sleep Tracker' THEN 'Professional sleep monitoring device analyzing sleep stages, breathing patterns, and heart rate variability. Get personalized insights for better rest.'
  ELSE description
END
WHERE category = 'medical';