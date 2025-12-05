-- FIX: Update Products RLS Policies
-- Run this in Supabase SQL Editor to fix the 403 error

-- 1. Drop existing policies
DROP POLICY IF EXISTS "Public can view active products" ON products;
DROP POLICY IF EXISTS "Admins can manage products" ON products;
DROP POLICY IF EXISTS "Allow anyone to read products" ON products;

-- 2. Create new policies
-- Allow everyone to read active products
CREATE POLICY "Public can view active products" 
ON products FOR SELECT 
USING (is_active = true);

-- Allow admins to do everything (INSERT, UPDATE, DELETE, SELECT)
CREATE POLICY "Admins can manage products" 
ON products FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Verify policies
SELECT schemaname, tablename, policyname, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'products';
