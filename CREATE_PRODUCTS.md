-- 1. Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price_thb INTEGER NOT NULL,
    image_url TEXT,
    category TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies
-- Allow everyone to read active products
CREATE POLICY "Public can view active products" 
ON products FOR SELECT 
USING (is_active = true);

-- Allow admins to manage products (INSERT, UPDATE, DELETE)
CREATE POLICY "Admins can manage products" 
ON products FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- 4. Seed initial products
INSERT INTO products (name, description, price_thb, category, image_url, is_active)
VALUES
    ('Organic Coconut Oil', 'Pure organic coconut oil for skin and hair.', 350, 'Body Care', '/images/products/coconut-oil.webp', true),
    ('Aloe Vera Gel', 'Soothing gel for after-sun care.', 250, 'After Sun', '/images/products/aloe-vera.webp', true),
    ('Lemongrass Essential Oil', 'Refreshing aromatherapy oil.', 450, 'Aromatherapy', '/images/products/lemongrass.webp', true),
    ('Handmade Soap Set', 'Natural handmade soaps with essential oils.', 300, 'Skincare', '/images/products/soap-set.webp', true);
