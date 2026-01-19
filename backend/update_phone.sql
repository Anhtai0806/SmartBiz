-- ============================================
-- Update phone for owner@smartbiz.com
-- ============================================

USE smartbiz;

-- Check current phone value
SELECT email, phone, full_name, role 
FROM users 
WHERE email = 'owner@smartbiz.com';

-- Update phone number
UPDATE users 
SET phone = '+84902345678' 
WHERE email = 'owner@smartbiz.com';

-- Verify the update
SELECT email, phone, full_name, role 
FROM users 
WHERE email = 'owner@smartbiz.com';
