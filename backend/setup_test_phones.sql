-- ============================================
-- Update Phone Numbers for All Test Users
-- Required for email/phone login functionality
-- ============================================

USE smartbiz;

-- Check current phone values
SELECT email, phone, full_name, role 
FROM users 
ORDER BY role;

-- Update phone numbers for all test users
UPDATE users SET phone = '+84901234567' WHERE email = 'admin@smartbiz.com';
UPDATE users SET phone = '+84902345678' WHERE email = 'owner@smartbiz.com';
UPDATE users SET phone = '+84903456789' WHERE email = 'staff@smartbiz.com';
UPDATE users SET phone = '+84904567890' WHERE email = 'cashier@smartbiz.com';

-- Verify the updates
SELECT email, phone, full_name, role 
FROM users 
ORDER BY role;

-- Test queries to verify login will work
SELECT 'Test: Find by email' as test_type, email, phone, role 
FROM users 
WHERE email = 'owner@smartbiz.com';

SELECT 'Test: Find by phone' as test_type, email, phone, role 
FROM users 
WHERE phone = '+84902345678';
