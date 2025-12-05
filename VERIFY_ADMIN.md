-- VERIFY: Check if your user is really an admin
-- Run this in Supabase SQL Editor

-- Check current user role
SELECT 
    id,
    email,
    full_name,
    role,
    created_at
FROM profiles
WHERE email = 'admin@aura.com';

-- If role is NOT 'admin', run this:
-- UPDATE profiles SET role = 'admin' WHERE email = 'admin@aura.com';

-- Then verify admin has permission by checking this query:
SELECT 
    auth.uid() as current_user_id,
    p.role as user_role,
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    ) as has_admin_rights
FROM profiles p
WHERE p.id = auth.uid();
