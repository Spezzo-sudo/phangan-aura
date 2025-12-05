-- STEP 1: Update Services Pricing (Business Model konform)
-- Run this in Supabase SQL Editor

-- Update existing services to correct prices
UPDATE services SET price_thb = 1000 WHERE title = 'Thai Oil Massage';
UPDATE services SET price_thb = 1600 WHERE title = 'Deep Tissue Massage';

-- Add new Aromatherapy service
INSERT INTO services (title, description, category, duration_min, price_thb, image_url, is_active)
VALUES 
    ('Aromatherapy Oil Massage', 'Relaxing aromatherapy massage with premium essential oils.', 'massage', 60, 1400, '/images/services/aromatherapy.webp', true);

-- Verify
SELECT title, price_thb, category FROM services ORDER BY price_thb;
